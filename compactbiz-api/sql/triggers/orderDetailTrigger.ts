export const orderDetailTriggerRecalculateSubtotal = `
    CREATE OR REPLACE FUNCTION compactbiz.order_detail_trigger_recalculate_subtotals()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $function$
    BEGIN
        CASE TG_OP
            WHEN 'DELETE' THEN
                PERFORM compactbiz.order_trigger_after_calculate_subtotal(old."companyId", old."facilityId", old."businessId", old."orderId");
            ELSE
                PERFORM compactbiz.order_trigger_after_calculate_subtotal(new."companyId", new."facilityId", new."businessId", new."orderId");
        END CASE;
        RETURN old;
    END;
    $function$;
`;

export const orderDetailTriggerAfter = `
    CREATE TRIGGER order_detail_trigger_after_update AFTER INSERT OR DELETE ON "compactbiz"."order_detail"
    FOR EACH ROW EXECUTE PROCEDURE compactbiz.order_detail_trigger_recalculate_subtotals()
`;