import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderTrigger1708980354252 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION compactbiz.calculate_subtotal(company_id integer, facility_id integer, customer_id integer, order_id integer)
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
                            o."customerId" = od."customerId" AND
                            o.id = od."orderId"
                        WHERE
                            od."companyId" = company_id AND
                            od."facilityId" = facility_id AND
                            od."customerId" = customer_id AND
                            od."orderId" = order_id
                    ) x;
                END;
            $function$;
        `);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION compactbiz.order_trigger_after_calculate_subtotal(company_id integer, facility_id integer, customer_id integer, order_id integer)
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
                        o."customerId" = customer_id AND
                        o."id" = order_id;
                    SELECT * FROM compactbiz.calculate_subtotal(company_id, facility_id, customer_id, order_id) into summed;
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
                        "customerId" = order_data."customerId" AND
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
                PERFORM compactbiz.order_trigger_after_calculate_subtotal(new."companyId", new."facilityId", new."customerId", new."id");
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TRIGGER order_trigger_after_update ON "compactbiz"."order"
        `);
        await queryRunner.query(`
            DROP FUNCTION compactbiz.order_trigger_order_after_calculate_subtotals()
        `);
        await queryRunner.query(`
            DROP FUNCTION compactbiz.order_trigger_after_calculate_subtotal()
        `);
        await queryRunner.query(`
            DROP FUNCTION compactbiz.calculate_subtotal(integer, integer, integer, integer)
        `);
    }

}
