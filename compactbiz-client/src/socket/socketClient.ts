import { io, Socket } from "socket.io-client";
import { config } from "../config";

let socket: Socket | null = null;

const getSocketUrl = (): string => config.apiUrl.replace("/api", "");

export const connectSocket = (): Socket => {
    if (socket?.connected) {
        return socket;
    }
    if (socket) {
        socket.disconnect();
    }
    socket = io(getSocketUrl(), {
        auth: (cb) => cb({
            token: localStorage.getItem("idToken"),
            facilityId: parseInt(localStorage.getItem("facilityId") || "0")
        }),
        transports: ["websocket"]
    });
    return socket;
};

export const disconnectSocket = (): void => {
    socket?.disconnect();
    socket = null;
};

export const getSocket = (): Socket | null => socket;
