import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPackageAdjustmentNewTriger1731367634716 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE OR REPLACE FUNCTION compactbiz.package_adjustment_trigger_fn()
            RETURNS trigger
            LANGUAGE plpgsql
            AS $function$
            BEGIN
                CASE TG_OP
                    WHEN 'DELETE' THEN
                        PERFORM "compactbiz"."update_package_quantity_balance"(old."companyId", old."facilityId", old."packageId", old."locationId");
                        PERFORM "compactbiz"."update_package_balance"(old."companyId", old."facilityId", old."packageId");
                        PERFORM compactbiz.order_trigger_after_calculate_subtotal(old."companyId", old."facilityId", old."businessId", old."orderId");
                    ELSE
                        PERFORM compactbiz.order_detail_update_quantity(new."companyId", new."facilityId", new."businessId", new."orderId", new."packageId");
                        PERFORM "compactbiz"."update_package_quantity_balance"(new."companyId", new."facilityId", new."packageId", new."locationId");
                        PERFORM "compactbiz"."update_package_balance"(new."companyId", new."facilityId", new."packageId");
                        PERFORM compactbiz.order_trigger_after_calculate_subtotal(new."companyId", new."facilityId", new."businessId", new."orderId");
                END CASE;
            RETURN old;
            END;
            $function$`
        );
        await queryRunner.query(`DROP TRIGGER package_adjustment_trigger_after_update ON "compactbiz"."package_adjustment"`);
        await queryRunner.query(`DROP FUNCTION compactbiz.package_adjustment_trigger_recalculate_balance()`);
        await queryRunner.query(`DROP TRIGGER package_adjustment_trigger ON "compactbiz"."package_adjustment"`);
        await queryRunner.query(
            `CREATE TRIGGER package_adjustment_trigger
            AFTER INSERT OR DELETE ON "compactbiz"."package_adjustment"
            FOR EACH ROW EXECUTE PROCEDURE compactbiz.package_adjustment_trigger_fn()`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
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
            CREATE TRIGGER package_adjustment_trigger_after_update AFTER INSERT ON "compactbiz"."package_adjustment"
            FOR EACH ROW EXECUTE PROCEDURE compactbiz.package_adjustment_trigger_recalculate_balance();
        `);
    }

}
