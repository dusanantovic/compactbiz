import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangePQTrigger1731368809663 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE OR REPLACE FUNCTION compactbiz.update_package_quantity_balance(company_id integer, facility_id integer, package_id integer, location_id integer)
            RETURNS void
            LANGUAGE plpgsql
            AS $function$
                BEGIN
                    UPDATE compactbiz.package_quantity pq SET
                        quantity = x.quantity,
                        reserved = x.reserved
                    FROM (
                        SELECT
                            pq."companyId",
                            pq."facilityId",
                            pq."locationId",
                            pq."packageId",
                            COALESCE(SUM(pa.delta), 0) AS "quantity",
                            0 as "reserved"
                        FROM
                            compactbiz.package_quantity pq
                        LEFT JOIN compactbiz.package_adjustment pa ON
                            pa."companyId" = pq."companyId" AND
                            pa."facilityId" = pq."facilityId" AND
                            pa."locationId" = pq."locationId" AND
                            pa."packageId" = pq."packageId"
                        WHERE
                            pq."companyId" = company_id AND
                            pq."facilityId" = facility_id AND
                            pq."packageId" = package_id AND
                            pq."locationId" = location_id
                        GROUP BY
                            pq."companyId",
                            pq."facilityId",
                            pq."locationId",
                            pq."packageId"
                    ) x
                    WHERE
                        pq."companyId" = x."companyId" AND
                        pq."facilityId" = x."facilityId" AND
                        pq."locationId" = x."locationId" AND
                        pq."packageId" = x."packageId";
                END;
            $function$`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Empty
    }

}
