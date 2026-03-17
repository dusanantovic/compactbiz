export const orderTriggerAfterCalculateSubtotal = `
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
                "order" o
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
`;

export const orderTriggerOrderAfterCalculateSubtotals = `
    CREATE OR REPLACE FUNCTION compactbiz.order_trigger_order_after_calculate_subtotals()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $function$
    BEGIN
        PERFORM compactbiz.order_trigger_after_calculate_subtotal(new."companyId", new."facilityId", new."businessId", new."id");
        RETURN new;
    END;
    $function$;
`; 

export const orderTriggerAfterUpdate = `
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
`;