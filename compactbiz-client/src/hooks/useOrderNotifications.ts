import { useEffect, useRef } from "react";
import { connectSocket, disconnectSocket } from "../socket/socketClient";
import { OrderStatus, OrderType } from "models/enums";

export type OrderAction = "created" | "updated" | "statusChanged";

export interface OrderNotification {
    orderId: number;
    identity: string;
    status: OrderStatus;
    type: OrderType;
    businessName?: string;
    triggeredByUserId: number;
    action: OrderAction;
}

export const useOrderNotifications = (onNotification: (n: OrderNotification) => void): void => {
    const callbackRef = useRef(onNotification);
    callbackRef.current = onNotification;

    useEffect(() => {
        const token = localStorage.getItem("idToken");
        const facilityId = parseInt(localStorage.getItem("facilityId") || "0");

        if (!token || !facilityId) {
            return;
        }

        const socket = connectSocket();

        const handler = (notification: OrderNotification) => {
            callbackRef.current(notification);
        };

        socket.on("order:update", handler);

        return () => {
            socket.off("order:update", handler);
            disconnectSocket();
        };
    }, []);
};
