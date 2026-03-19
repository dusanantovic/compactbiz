import React, { useCallback, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import { useRefresh } from "react-admin";
import { useLocation } from "react-router-dom";
import { useOrderNotifications, OrderNotification } from "../hooks/useOrderNotifications";
import { OrderStatus } from "models/enums";

interface ActiveNotification extends OrderNotification {
    id: number;
}

const statusLabel: Record<OrderStatus, string> = {
    [OrderStatus.Temporary]: "created",
    [OrderStatus.Pending]: "submitted",
    [OrderStatus.InProgress]: "started",
    [OrderStatus.Delivery]: "out for delivery",
    [OrderStatus.Complete]: "completed",
    [OrderStatus.Canceled]: "canceled",
    [OrderStatus.Refunded]: "refunded",
    [OrderStatus.Paused]: "paused"
};

const resolveLabel = (n: OrderNotification): string => {
    if (n.action === "updated") return "updated";
    return statusLabel[n.status] ?? n.status;
};

const statusColor: Partial<Record<OrderStatus, string>> = {
    [OrderStatus.Temporary]: "#9e9e9e",
    [OrderStatus.Pending]: "#ca8a04",
    [OrderStatus.InProgress]: "#0288d1",
    [OrderStatus.Delivery]: "#7c3aed",
    [OrderStatus.Complete]: "#2e7d32",
    [OrderStatus.Canceled]: "#d32f2f"
};

const resolveColor = (n: OrderNotification): string => {
    if (n.action === "updated") return "#f97316";
    return statusColor[n.status] ?? "#9e9e9e";
};

let notifCounter = 0;

export const OrderNotifications: React.FC = () => {
    const [notifications, setNotifications] = useState<ActiveNotification[]>([]);
    const refresh = useRefresh();
    const location = useLocation();

    const handleNotification = useCallback((n: OrderNotification) => {
        const currentUserId = parseInt(localStorage.getItem("userId") || "0");
        if (n.triggeredByUserId === currentUserId) {
            return;
        }
        if (location.pathname.includes("/orders")) {
            refresh();
        }
        const id = ++notifCounter;
        setNotifications(prev => [...prev, { ...n, id }]);
    }, [refresh, location.pathname]);

    useOrderNotifications(handleNotification);

    const handleClose = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <>
            {notifications.map((n, index) => (
                <Snackbar
                    key={n.id}
                    open
                    autoHideDuration={6000}
                    onClose={() => handleClose(n.id)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    style={{ bottom: 24 + index * 80 }}
                >
                    <Alert
                        onClose={() => handleClose(n.id)}
                        severity="info"
                        variant="filled"
                        sx={{ bgcolor: resolveColor(n) }}
                    >
                        Order #{n.identity}
                        {n.businessName ? ` (${n.businessName})` : ""} — {resolveLabel(n)}
                    </Alert>
                </Snackbar>
            ))}
        </>
    );
};
