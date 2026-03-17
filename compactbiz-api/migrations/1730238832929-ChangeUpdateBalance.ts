import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeUpdateBalance1730238832929 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`delete from compactbiz.package_adjustment;`);
        await queryRunner.query(`CREATE TYPE "compactbiz"."package_adjustment_type_enum" AS ENUM('PurchaseOrder', 'SellOrder', 'CreateProduct')`);
        await queryRunner.query(`ALTER TABLE compactbiz."package_adjustment" ADD "type" "compactbiz"."package_adjustment_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE compactbiz."package_adjustment" ADD "businessId" integer`);
        await queryRunner.query(`ALTER TABLE compactbiz."package_adjustment" ADD "orderId" integer`);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION compactbiz.update_package_quantity_balance(company_id integer, facility_id integer, package_id integer, location_id integer)
            RETURNS void
            LANGUAGE plpgsql
            AS $function$
                BEGIN
                    UPDATE compactbiz.package_quantity pq SET
                        quantity = x.quantity,
                        reserved = x.reserved
                    FROM (
                        SELECT
                            pa."companyId",
                            pa."facilityId",
                            pa."locationId",
                            pa."packageId",
                            SUM(pa.delta) AS "quantity",
                            0 as "reserved"
                        FROM
                            compactbiz.package_adjustment pa
                        WHERE
                            pa."companyId" = company_id AND
                            pa."facilityId" = facility_id AND
                            pa."packageId" = package_id AND
                            pa."locationId" = location_id
                        GROUP BY
                            pa."companyId",
                            pa."facilityId",
                            pa."locationId",
                            pa."packageId"
                    ) x
                    WHERE
                        pq."companyId" = x."companyId" AND
                        pq."facilityId" = x."facilityId" AND
                        pq."locationId" = x."locationId" AND
                        pq."packageId" = x."packageId";
                END;
            $function$
        `);
        await queryRunner.query(`
            DROP FUNCTION IF EXISTS compactbiz.calculate_detail_quantity(integer, integer, integer, integer, integer);
        `);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION compactbiz.calculate_detail_quantity(company_id integer, facility_id integer, business_id integer, order_id integer, package_id integer)
            RETURNS TABLE(quantity integer, productid integer)
            LANGUAGE plpgsql
            AS $function$
                BEGIN
                    RETURN QUERY
                    SELECT
                        COALESCE(SUM(ABS(pa."delta")), 0)::integer AS "quantity",
                        COALESCE(MIN(p."productId"), 0)::integer as "productid"
                    FROM
                        compactbiz."package_adjustment" pa
                    INNER JOIN compactbiz."package" p ON p."companyId" = pa."companyId" AND p."facilityId" = pa."facilityId" AND p."id" = pa."packageId"
                    WHERE
                        pa."companyId" = company_id AND
                        pa."facilityId" = facility_id AND
                        pa."packageId" = package_id AND
                        pa."businessId" = business_id AND
                        pa."orderId" = order_id;
                END;
            $function$;
        `);
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS order_detail_trigger_after_update ON "compactbiz"."order_detail"
        `);
        await queryRunner.query(`
            DROP FUNCTION IF EXISTS compactbiz.order_detail_trigger_recalculate_balance();
        `);
        await queryRunner.query(`
            DROP FUNCTION IF EXISTS compactbiz.order_detail_update_quantity(integer, integer, integer, integer, integer);
        `);
        await queryRunner.query(`
            DROP FUNCTION IF EXISTS compactbiz.order_detail_trigger_order_calculate_subtotals();
        `);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION compactbiz.order_detail_trigger_recalculate_subtotals()
            RETURNS trigger
            LANGUAGE plpgsql
            AS $function$
            BEGIN
                CASE TG_OP
                    WHEN 'DELETE' THEN
                        PERFORM compactbiz.order_trigger_after_calculate_subtotal(old."companyId", old."facilityId", old."businessId", old."orderId");
                    ELSE
                        PERFORM compactbiz.order_trigger_after_calculate_subtotal(new."companyId", new."facilityId", new."businessId", new."orderId");
                END CASE;
                RETURN old;
            END;
            $function$;
        `);
        await queryRunner.query(`
            CREATE TRIGGER order_detail_trigger_after_update AFTER INSERT OR DELETE ON "compactbiz"."order_detail"
            FOR EACH ROW EXECUTE PROCEDURE compactbiz.order_detail_trigger_recalculate_subtotals()
        `);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION compactbiz.order_detail_update_quantity(company_id integer, facility_id integer, business_id integer, order_id integer, package_id integer)
            RETURNS void
            LANGUAGE plpgsql
            AS $function$
                DECLARE summed RECORD;
                BEGIN
                    SELECT * FROM compactbiz.calculate_detail_quantity(company_id, facility_id, business_id, order_id, package_id) into summed;
                    UPDATE "compactbiz"."order_detail" SET
                        "quantity" = summed."quantity"
                    WHERE
                        "companyId" = company_id AND
                        "facilityId" = facility_id AND
                        "businessId" = business_id AND
                        "orderId" = order_id AND
                        "productId" = summed."productid";
                END;
            $function$
        `);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION compactbiz.package_adjustment_trigger_recalculate_balance()
            RETURNS trigger
            LANGUAGE plpgsql
            AS $function$
            BEGIN
                PERFORM compactbiz.order_detail_update_quantity(new."companyId", new."facilityId", new."businessId", new."orderId", new."packageId");
                PERFORM compactbiz.update_package_quantity_balance(new."companyId", new."facilityId", new."packageId", new."locationId");
                PERFORM compactbiz.update_package_balance(new."companyId", new."facilityId", new."packageId");
                PERFORM compactbiz.order_trigger_after_calculate_subtotal(new."companyId", new."facilityId", new."businessId", new."orderId");
                RETURN old;
            END;
            $function$;
        `);
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS package_adjustment_trigger_after_update ON "compactbiz"."package_adjustment"
        `);
        await queryRunner.query(`
            CREATE TRIGGER package_adjustment_trigger_after_update AFTER INSERT ON "compactbiz"."package_adjustment"
            FOR EACH ROW EXECUTE PROCEDURE compactbiz.package_adjustment_trigger_recalculate_balance();
        `);
        await queryRunner.query(`
            ALTER TABLE IF EXISTS compactbiz."order_detail_quantity" DROP CONSTRAINT "FK_e1b71c85871193a4a5aa7ca1743"
        `);
        await queryRunner.query(`
            ALTER TABLE IF EXISTS compactbiz."order_detail_quantity" DROP CONSTRAINT "order_detail_quantity_>_0"
        `);
        await queryRunner.query(`
            DROP TABLE IF EXISTS compactbiz.order_detail_quantity;
        `);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS package_adjustment_trigger_after_update ON "compactbiz"."package_adjustment"
        `);
        await queryRunner.query(`
            DROP FUNCTION IF EXISTS compactbiz.package_adjustment_trigger_recalculate_balance();
        `);
        await queryRunner.query(`
            DROP FUNCTION IF EXISTS compactbiz.order_detail_update_quantity();
        `);
        await queryRunner.query(`
            DROP FUNCTION IF EXISTS compactbiz.calculate_detail_quantity(integer, integer, integer, integer, integer);
        `);
        await queryRunner.query(`ALTER TABLE compactbiz."package_adjustment" DROP COLUMN IF EXISTS "orderId"`);
        await queryRunner.query(`ALTER TABLE compactbiz."package_adjustment" DROP COLUMN IF EXISTS "businessId"`);
        await queryRunner.query(`ALTER TABLE compactbiz."package_adjustment" DROP COLUMN IF EXISTS "type"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "compactbiz"."package_adjustment_type_enum"`);
    }

}
