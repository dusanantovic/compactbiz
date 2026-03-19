import { OrderStatus, OrderType } from "../../models/enums";
import { getIo } from "../socket/socketServer";

export type OrderAction = "created" | "updated" | "statusChanged";

export interface OrderUpdatePayload {
    orderId: number;
    identity: string;
    status: OrderStatus;
    type: OrderType;
    businessName?: string;
    triggeredByUserId: number;
    action: OrderAction;
}

export const emitOrderUpdate = (companyId: number, facilityId: number, payload: OrderUpdatePayload): void => {
    try {
        const io = getIo();
        io.to(`facility:${companyId}:${facilityId}`).emit("order:update", payload);
    } catch {
        // Socket server not initialized (e.g. in tests), skip silently
    }
};
