import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeCustomerToBusinessAndAddProductType1730062440187 implements MigrationInterface {
    name = "ChangeCustomerToBusinessAndAddProductType1730062440187";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TRIGGER order_detail_trigger_after_update ON "compactbiz"."order_detail";
            DROP FUNCTION compactbiz.order_detail_trigger_recalculate_balance();
            DROP FUNCTION compactbiz.order_detail_update_quantity();
            DROP FUNCTION compactbiz.order_detail_trigger_order_calculate_subtotals(integer, integer, integer, integer);

            DROP TRIGGER order_trigger_after_update ON "compactbiz"."order";
            DROP FUNCTION compactbiz.order_trigger_order_after_calculate_subtotals();
            DROP FUNCTION compactbiz.order_trigger_after_calculate_subtotal(integer, integer, integer, integer);

            DROP FUNCTION compactbiz.calculate_subtotal(integer, integer, integer, integer);
            DROP FUNCTION compactbiz.calculate_detail_quantity(integer, integer, integer, integer, integer);
        `);

        await queryRunner.query(`ALTER TABLE compactbiz."order_detail_quantity" DROP CONSTRAINT "FK_767fbd0cfe3f40a3f8aa73121b0"`);
        await queryRunner.query(`ALTER TABLE compactbiz."order_detail" DROP CONSTRAINT "FK_919ad61014b211d70b2fdea947c"`);
        await queryRunner.query(`ALTER TABLE compactbiz."product" DROP CONSTRAINT "product_price_>=_0"`);
        await queryRunner.query(`ALTER TABLE compactbiz."product" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE compactbiz."order_detail_quantity" RENAME COLUMN "customerId" TO "businessId"`);
        await queryRunner.query(`ALTER TABLE compactbiz."order_detail" RENAME COLUMN "customerId" TO "businessId"`);
        await queryRunner.query(`ALTER TABLE compactbiz."order" DROP CONSTRAINT "PK_cf8ad5fab0345386b73aec5d030"`);
        await queryRunner.query(`ALTER TABLE compactbiz."order" ADD CONSTRAINT "PK_d81e14c98b346b0b8a1f1584f28" PRIMARY KEY ("companyId", "facilityId", "id")`);
        await queryRunner.query(`ALTER TABLE compactbiz."order" DROP COLUMN "customerId"`);
        await queryRunner.query(`ALTER TABLE compactbiz."order" DROP COLUMN "driverId"`);
        await queryRunner.query(`ALTER TABLE compactbiz."order" ADD "businessId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE compactbiz."order" DROP CONSTRAINT "PK_d81e14c98b346b0b8a1f1584f28"`);
        await queryRunner.query(`ALTER TABLE compactbiz."order" ADD CONSTRAINT "PK_13f1b3ef801cbdf8ebb77eba6f8" PRIMARY KEY ("companyId", "facilityId", "id", "businessId")`);
        await queryRunner.query(`ALTER TYPE "compactbiz"."order_type_enum" RENAME TO "order_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "compactbiz"."order_type_enum" AS ENUM('Purchase', 'Sell')`);
        await queryRunner.query(`ALTER TABLE compactbiz."order" ALTER COLUMN "type" TYPE "compactbiz"."order_type_enum" USING "type"::"text"::"compactbiz"."order_type_enum"`);
        await queryRunner.query(`DROP TYPE "compactbiz"."order_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "compactbiz"."product_type_enum" AS ENUM('Purchase', 'Sell', 'Both')`);
        await queryRunner.query(`ALTER TABLE compactbiz."product" ADD "type" "compactbiz"."product_type_enum" NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "company_facility_product" ON compactbiz.package ("companyId", "facilityId", "productId") `);
        await queryRunner.query(`ALTER TABLE compactbiz."order_detail_quantity" ADD CONSTRAINT "FK_e1b71c85871193a4a5aa7ca1743" FOREIGN KEY ("companyId", "facilityId", "businessId", "orderId", "productId") REFERENCES compactbiz."order_detail"("companyId","facilityId","businessId","orderId","productId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE compactbiz."order_detail" ADD CONSTRAINT "FK_f686fae8ea155a607c03a950c4a" FOREIGN KEY ("companyId", "facilityId", "businessId", "orderId") REFERENCES compactbiz."order"("companyId","facilityId","businessId","id") ON DELETE CASCADE ON UPDATE CASCADE`);

        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION compactbiz.update_package_quantity_balance(company_id integer, facility_id integer, package_id integer, location_id integer)
            RETURNS void
            LANGUAGE plpgsql
            AS $function$
                BEGIN
                    UPDATE compactbiz.package_quantity pq SET
                        quantity = y.quantity,
                        reserved = y.reserved
                    FROM (
                        SELECT
                            x."companyId",
                            x."facilityId",
                            x."locationId",
                            x."packageId",
                            SUM(x.quantity) AS "quantity",
                            SUM(x.reserved) AS "reserved"
                        FROM (
                            SELECT
                                od."companyId",
                                od."facilityId",
                                od."locationId",
                                od."packageId",
                                SUM(
                                    CASE
                                        WHEN o.status IN ('Complete', 'Refunded') THEN
                                            -od."quantity"
                                        ELSE
                                            0
                                    END
                                ) AS "quantity",
                                SUM(
                                    CASE
                                        WHEN o.status IN ('Temporary', 'Pending', 'InProgress', 'Paused') THEN
                                            od."quantity"
                                        ELSE
                                            0
                                    END
                                ) as "reserved"
                            FROM
                                compactbiz.order_detail od
                            INNER JOIN compactbiz."order" o ON
                                o."companyId" = od."companyId" AND
                                o."facilityId" = od."facilityId" AND
                                o."businessId" = od."businessId" AND
                                o.id = od."orderId"
                            WHERE
                                od."companyId" = company_id AND
                                od."facilityId" = facility_id AND
                                od."packageId" = package_id AND
                                od."locationId" = location_id
                            GROUP BY
                                od."companyId",
                                od."facilityId",
                                od."locationId",
                                od."packageId"
                            UNION
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
                        GROUP BY
                            x."companyId",
                            x."facilityId",
                            x."locationId",
                            x."packageId"
                    ) y
                    WHERE
                        pq."companyId" = y."companyId" AND
                        pq."facilityId" = y."facilityId" AND
                        pq."locationId" = y."locationId" AND
                        pq."packageId" = y."packageId";
                END;
            $function$
        `);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION compactbiz.calculate_detail_quantity(company_id integer, facility_id integer, business_id integer, order_id integer, product_id integer)
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
                        odq."businessId" = business_id AND
                        odq."orderId" = order_id AND
                        odq."productId" = product_id;
                END;
            $function$;
        `);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION compactbiz.calculate_subtotal(company_id integer, facility_id integer, business_id integer, order_id integer)
            RETURNS TABLE(subtotal numeric)
            LANGUAGE plpgsql
            AS $function$
                BEGIN
                    RETURN QUERY
                    SELECT
                        COALESCE(SUM(x.subtotal), 0) AS "subtotal"
                    from (
                        SELECT
                            (od."price" * od."quantity") AS "subtotal"
                        FROM
                            compactbiz."order_detail" od
                        INNER JOIN compactbiz."order" o ON
                            o."companyId" = od."companyId" AND
                            o."facilityId" = od."facilityId" AND
                            o."businessId" = od."businessId" AND
                            o.id = od."orderId"
                        WHERE
                            od."companyId" = company_id AND
                            od."facilityId" = facility_id AND
                            od."businessId" = business_id AND
                            od."orderId" = order_id
                    ) x;
                END;
            $function$;
        `);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION compactbiz.order_trigger_after_calculate_subtotal(company_id integer, facility_id integer, business_id integer, order_id integer)
            RETURNS void
            LANGUAGE plpgsql
            AS $function$
                DECLARE summed RECORD;
                DECLARE order_data "compactbiz"."order";
                BEGIN
                    SELECT
                        * INTO order_data
                    FROM
                        compactbiz."order" o
                    WHERE
                        o."companyId" = company_id AND
                        o."facilityId" = facility_id AND
                        o."businessId" = business_id AND
                        o."id" = order_id;
                    SELECT * FROM compactbiz.calculate_subtotal(company_id, facility_id, business_id, order_id) into summed;
                    order_data."subtotal" := summed."subtotal";
                    order_data."total" := order_data."subtotal" + order_data."taxes" + order_data."delivery" - order_data."discount";
                    UPDATE "compactbiz"."order" SET
                        "subtotal" = order_data."subtotal",
                        "delivery" = order_data."delivery",
                        "discount" = order_data."discount",
                        "taxes" = order_data."taxes",
                        "total" = order_data."total"
                    WHERE
                        "companyId" = order_data."companyId" AND
                        "facilityId" = order_data."facilityId" AND
                        "businessId" = order_data."businessId" AND
                        "id" = order_data."id";
                END;
            $function$
        `);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION compactbiz.order_trigger_order_after_calculate_subtotals()
            RETURNS trigger
            LANGUAGE plpgsql
            AS $function$
            BEGIN
                PERFORM compactbiz.order_trigger_after_calculate_subtotal(new."companyId", new."facilityId", new."businessId", new."id");
                RETURN new;
            END;
            $function$;
        `);
        await queryRunner.query(`
            CREATE TRIGGER order_trigger_after_update AFTER UPDATE ON "compactbiz"."order"
            FOR EACH ROW WHEN (
                old.delivery IS DISTINCT FROM new.delivery OR
                old."type" IS DISTINCT FROM new."type" OR
                old.status IS DISTINCT FROM new.status OR
                old.subtotal IS DISTINCT FROM new.subtotal OR
                old.discount IS DISTINCT FROM new.discount OR
                old.taxes IS DISTINCT FROM new.taxes
            )
            EXECUTE PROCEDURE compactbiz.order_trigger_order_after_calculate_subtotals()
        `);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION compactbiz.order_detail_trigger_order_calculate_subtotals(company_id integer, facility_id integer, business_id integer, order_id integer)
            RETURNS void
            LANGUAGE plpgsql
            AS $function$
            BEGIN
                PERFORM compactbiz.order_trigger_after_calculate_subtotal(company_id, facility_id, business_id, order_id);
            END;
            $function$;
        `);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION compactbiz.order_detail_update_quantity(company_id integer, facility_id integer, business_id integer, order_id integer, product_id integer)
            RETURNS void
            LANGUAGE plpgsql
            AS $function$
                DECLARE summed RECORD;
                BEGIN
                    SELECT * FROM compactbiz.calculate_detail_quantity(company_id, facility_id, business_id, order_id, product_id) into summed;
                    UPDATE "compactbiz"."order_detail" SET
                        "quantity" = summed."quantity"
                    WHERE
                        "companyId" = company_id AND
                        "facilityId" = facility_id AND
                        "businessId" = business_id AND
                        "orderId" = order_id AND
                        "productId" = product_id;
                END;
            $function$
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
                        PERFORM compactbiz.order_trigger_after_calculate_subtotal(old."companyId", old."facilityId", old."businessId", old."orderId");
                        PERFORM compactbiz.order_detail_trigger_order_calculate_subtotals(old."companyId", old."facilityId", old."businessId", old."orderId");
                    ELSE
                        PERFORM compactbiz.order_detail_update_quantity(new."companyId", new."facilityId", new."businessId", new."orderId", new."productId");
                        PERFORM compactbiz.update_package_quantity_balance(new."companyId", new."facilityId", new."packageId", new."locationId");
                        PERFORM compactbiz.update_package_balance(new."companyId", new."facilityId", new."packageId");
                        PERFORM compactbiz.order_detail_trigger_order_calculate_subtotals(new."companyId", new."facilityId", new."businessId", new."orderId");
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
        // EMPTY
    }

}
