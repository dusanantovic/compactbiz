export const calculateDetailQuantityFn = `
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
                "package_adjustment" pa
            INNER JOIN "package" p ON p."companyId" = pa."companyId" AND p."facilityId" = pa."facilityId" AND p."id" = pa."packageId"
            WHERE
                pa."companyId" = company_id AND
                pa."facilityId" = facility_id AND
                pa."packageId" = package_id AND
                pa."businessId" = business_id AND
                pa."orderId" = order_id;
        END;
    $function$;
`;