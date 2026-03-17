import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderDetailTrigger1708982951867 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION compactbiz.calculate_detail_quantity(company_id integer, facility_id integer, customer_id integer, order_id integer, product_id integer)
            RETURNS TABLE(quantity integer)
            LANGUAGE plpgsql
            AS $function$
                BEGIN
                    RETURN QUERY
                    SELECT
                        SUM(od."quantity") AS "quantity"
                    FROM
                        compactbiz."order_detail_quantity" odq
                    WHERE
                        odq."companyId" = company_id AND
                        odq."facilityId" = facility_id AND
                        odq."customerId" = customer_id AND
                        odq."orderId" = order_id AND
                        odq."productId" = product_id;
                END;
            $function$;
        `);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION compactbiz.order_detail_update_quantity()
            RETURNS void
            LANGUAGE plpgsql
            AS $function$
                DECLARE summed RECORD;
                BEGIN
                    SELECT * FROM compactbiz.calculate_detail_quantity(new."companyId", new."facilityId", new."customerId", new."orderId", new."productId") into summed;
                    UPDATE "compactbiz"."order_detail" SET
                        "quantity" = summed."quantity"
                    WHERE
                        "companyId" = new."companyId" AND
                        "facilityId" = new."facilityId" AND
                        "customerId" = new."customerId" AND
                        "orderId" = new."orderId" AND
                        "productId" = new."productId";
                END;
            $function$
        `);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION compactbiz.order_detail_trigger_order_calculate_subtotals(company_id integer, facility_id integer, customer_id integer, order_id integer)
            RETURNS void
            LANGUAGE plpgsql
            AS $function$
            BEGIN
                PERFORM compactbiz.order_trigger_after_calculate_subtotal(company_id, facility_id, customer_id, order_id);
            END;
            $function$;
        `);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION compactbiz.order_detail_trigger_recalculate_balance()
            RETURNS trigger
            LANGUAGE plpgsql
            AS $function$
            BEGIN
                CASE TG_OP
                    WHEN 'DELETE' THEN
                        PERFORM compactbiz.update_package_quantity_balance(old."companyId", old."facilityId", old."packageId", old."locationId");
                        PERFORM compactbiz.update_package_balance(old."companyId", old."facilityId", old."packageId");
                        PERFORM compactbiz.order_trigger_after_calculate_subtotal();
                        PERFORM compactbiz.order_detail_trigger_order_calculate_subtotals(old."companyId", old."facilityId", old."customerId", old."orderId");
                    ELSE
                        PERFORM compactbiz.order_detail_update_quantity(new."companyId", new."facilityId", new."customerId", new."orderId", new."productId");
                        PERFORM compactbiz.update_package_quantity_balance(new."companyId", new."facilityId", new."packageId", new."locationId");
                        PERFORM compactbiz.update_package_balance(new."companyId", new."facilityId", new."packageId");
                        PERFORM compactbiz.order_detail_trigger_order_calculate_subtotals(new."companyId", new."facilityId", new."customerId", new."orderId");
                END CASE;
                RETURN old;
            END;
            $function$;
        `);
        await queryRunner.query(`
            CREATE TRIGGER order_detail_trigger_after_update AFTER INSERT OR UPDATE OR DELETE ON "compactbiz"."order_detail"
            FOR EACH ROW EXECUTE PROCEDURE compactbiz.order_detail_trigger_recalculate_balance()
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TRIGGER order_detail_trigger_after_update ON "compactbiz"."order_detail"
        `);
        await queryRunner.query(`
            DROP FUNCTION compactbiz.order_detail_trigger_recalculate_balance()
        `);
        await queryRunner.query(`
            DROP FUNCTION compactbiz.order_detail_trigger_order_calculate_subtotals(integer, integer, integer, integer)
        `);
        await queryRunner.query(`
            DROP FUNCTION compactbiz.order_detail_update_quantity()
        `);
        await queryRunner.query(`
            DROP FUNCTION compactbiz.calculate_detail_quantity(integer, integer, integer, integer, integer, integer)
        `);
    }

}
