import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPackageAdjustmentTrigger1708976155892 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
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
                                o."customerId" = od."customerId" AND
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
            CREATE OR REPLACE FUNCTION compactbiz.update_package_balance(company_id integer, facility_id integer, package_id integer)
            RETURNS void
            LANGUAGE plpgsql
            AS $function$
                BEGIN
                    UPDATE compactbiz.package p SET
                        quantity = x.quantity,
                        reserved = x.reserved
                    FROM (
                        SELECT
                            pq."companyId",
                            pq."facilityId",
                            pq."packageId",
                            COALESCE(sum(pq.quantity), 0) AS "quantity",
                            COALESCE(sum(pq.reserved), 0) AS "reserved"
                        FROM
                            compactbiz.package_quantity pq
                        WHERE
                            pq."companyId" = company_id AND
                            pq."facilityId" = facility_id AND
                            pq."packageId" = package_id
                        GROUP BY
                            pq."companyId",
                            pq."facilityId",
                            pq."packageId"
                    ) x
                    WHERE
                        p."companyId" = x."companyId" AND
                        p."facilityId" = x."facilityId" AND
                        p.id = x."packageId";
                END;
            $function$
        `);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION compactbiz.package_adjustment_trigger_fn()
            RETURNS trigger
            LANGUAGE plpgsql
            AS $function$
            BEGIN
                CASE TG_OP
                    WHEN 'DELETE' THEN
                        PERFORM "compactbiz"."update_package_quantity_balance"(old."companyId", old."facilityId", old."packageId", old."locationId");
                        PERFORM "compactbiz"."update_package_balance"(old."companyId", old."facilityId", old."packageId");
                    ELSE
                        PERFORM "compactbiz"."update_package_quantity_balance"(new."companyId", new."facilityId", new."packageId", new."locationId");
                        PERFORM "compactbiz"."update_package_balance"(new."companyId", new."facilityId", new."packageId");
                END CASE;
            RETURN old;
            END;
            $function$
        `);
        await queryRunner.query(`
            CREATE TRIGGER package_adjustment_trigger
            AFTER INSERT OR UPDATE OR DELETE ON compactbiz.package_adjustment
            FOR EACH ROW EXECUTE PROCEDURE compactbiz.package_adjustment_trigger_fn()
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TRIGGER package_adjustment_trigger ON compactbiz.package_adjustment
        `);
        await queryRunner.query(`
            DROP FUNCTION compactbiz.package_adjustment_trigger_fn()
        `);
        await queryRunner.query(`
            DROP FUNCTION compactbiz.update_package_balance(integer, integer, integer)
        `);
        await queryRunner.query(`
            DROP FUNCTION compactbiz.update_package_quantity_balance(integer, integer, integer, integer)
        `);
    }

}
