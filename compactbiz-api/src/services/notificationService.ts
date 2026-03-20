import { OrderUpdatePayload } from "models/interfaces";
import { getIo } from "../socket/socketServer";

export const emitOrderUpdate = (companyId: number, facilityId: number, payload: OrderUpdatePayload): void => {
    try {
        const io = getIo();
        io.to(`facility:${companyId}:${facilityId}`).emit("order:update", payload);
    } catch {
        // Socket server not initialized (e.g. in tests), skip silently
    }
};
