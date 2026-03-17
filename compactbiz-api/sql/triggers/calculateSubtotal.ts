export const calculateSubtotalFn = `
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
                    "order_detail" od
                INNER JOIN "order" o ON
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
`;