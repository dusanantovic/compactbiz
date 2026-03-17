export const orderDetailUpdateQuantity = `
    CREATE OR REPLACE FUNCTION compactbiz.order_detail_update_quantity(company_id integer, facility_id integer, business_id integer, order_id integer, package_id integer)
    RETURNS void
    LANGUAGE plpgsql
    AS $function$
        DECLARE summed RECORD;
        BEGIN
            SELECT * FROM compactbiz.calculate_detail_quantity(company_id, facility_id, business_id, order_id, package_id) into summed;
            UPDATE "compactbiz"."order_detail" SET
                "quantity" = summed."quantity"
            WHERE
                "companyId" = company_id AND
                "facilityId" = facility_id AND
                "businessId" = business_id AND
                "orderId" = order_id AND
                "productId" = summed."productid";
        END;
    $function$
`;

export const packageAdjustmentTriggerFn = `
    CREATE OR REPLACE FUNCTION compactbiz.package_adjustment_trigger_fn()
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
    $function$
`;

export const packageAdjustmentTrigger = `
    CREATE TRIGGER package_adjustment_trigger
    AFTER INSERT OR DELETE ON "compactbiz"."package_adjustment"
    FOR EACH ROW EXECUTE PROCEDURE compactbiz.package_adjustment_trigger_fn()
`;