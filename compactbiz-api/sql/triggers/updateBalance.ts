export const updatePackageQuantityBalance = `
    CREATE OR REPLACE FUNCTION compactbiz.update_package_quantity_balance(company_id integer, facility_id integer, package_id integer, location_id integer)
    RETURNS void
    LANGUAGE plpgsql
    AS $function$
        BEGIN
            UPDATE package_quantity pq SET
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
                    package_quantity pq
                LEFT JOIN package_adjustment pa ON
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
    $function$
`;

export const updatePackageBalance = `
    CREATE OR REPLACE FUNCTION compactbiz.update_package_balance(company_id integer, facility_id integer, package_id integer)
    RETURNS void
    LANGUAGE plpgsql
    AS $function$
        BEGIN
            UPDATE package p SET
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
                    package_quantity pq
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
`;