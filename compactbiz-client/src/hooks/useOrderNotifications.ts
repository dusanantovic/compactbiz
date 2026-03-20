import { useEffect, useRef } from "react";
import { connectSocket, disconnectSocket } from "../socket/socketClient";
import { OrderUpdatePayload } from "models/interfaces";

export enum OrderAction {
    PurchaseCreated = "PurchaseCreated",
    SellCreated = "SellCreated",
    Updated = "Updated",
    StatusChanged = "StatusChanged"
}

export const useOrderNotifications = (onNotification: (n: OrderUpdatePayload) => void): void => {
    const callbackRef = useRef(onNotification);
    callbackRef.current = onNotification;

    useEffect(() => {
        const token = localStorage.getItem("idToken");
        const facilityId = parseInt(localStorage.getItem("facilityId") || "0");

        if (!token || !facilityId) {
            return;
        }

        const socket = connectSocket();

        const handler = (notification: OrderUpdatePayload) => {
            callbackRef.current(notification);
        };

        socket.on("order:update", handler);

        return () => {
            socket.off("order:update", handler);
            disconnectSocket();
        };
    }, []);
};
