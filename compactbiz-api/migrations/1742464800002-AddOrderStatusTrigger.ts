import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderStatusTrigger1742464800002 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION compactbiz.update_order_status_balance(company_id integer, facility_id integer, business_id integer, order_id integer)
            RETURNS void
            LANGUAGE plpgsql
            AS $function$
                DECLARE r RECORD;
                BEGIN
                    FOR r IN
                        SELECT DISTINCT pa."packageId", pa."locationId"
                        FROM compactbiz.package_adjustment pa
                        WHERE
                            pa."companyId" = company_id AND
                            pa."facilityId" = facility_id AND
                            pa."businessId" = business_id AND
                            pa."orderId" = order_id
                    LOOP
                        PERFORM compactbiz.update_package_quantity_balance(company_id, facility_id, r."packageId", r."locationId");
                        PERFORM compactbiz.update_package_balance(company_id, facility_id, r."packageId");
                    END LOOP;
                END;
            $function$
        `);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION compactbiz.order_status_trigger_fn()
            RETURNS trigger
            LANGUAGE plpgsql
            AS $function$
            BEGIN
                PERFORM compactbiz.update_order_status_balance(new."companyId", new."facilityId", new."businessId", new.id);
                RETURN new;
            END;
            $function$
        `);
        await queryRunner.query(`
            CREATE TRIGGER order_status_trigger
            AFTER UPDATE OF status ON "compactbiz"."order"
            FOR EACH ROW EXECUTE PROCEDURE compactbiz.order_status_trigger_fn()
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TRIGGER IF EXISTS order_status_trigger ON "compactbiz"."order"`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS compactbiz.order_status_trigger_fn()`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS compactbiz.update_order_status_balance(integer, integer, integer, integer)`);
    }

}
