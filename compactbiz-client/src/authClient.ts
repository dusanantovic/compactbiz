import { NonAuthorizedError } from "../models";
import { ChangePasswordBody, LoginResponse, RefreshBody, SendTempPinBody, StaffVerifyBody, VerifyBody } from "../models/interfaces";
import { config } from "./config";
import { clearCredentials, initCache } from "./cache";
import { http } from "./http";

export const login = async (email: string, password: string): Promise<boolean> => {
    const response = await http(`${config.apiUrl}/users/login`, {
        method: "POST",
        body: JSON.stringify({
            email,
            password
        })
    });
    const result = response.json as LoginResponse;
    Object.entries(result).map(([key, value]) => {
        if (value && typeof value === "object") {
            localStorage.setItem(key, JSON.stringify(value));
        } else {
            localStorage.setItem(key, `${value}`);
        }
    });
    initCache();
    return true;
};

export const sendTempPin = async (email: string) => {
    const body: SendTempPinBody = {
        email
    };
    const response = await http(`${config.apiUrl}/users/sendtemppin`, {
        method: "POST",
        body: JSON.stringify(body)
    });
    return response.json;
};

export const changePassword = async (email: string, tempPin: string, newPassword: string) => {
    const body: ChangePasswordBody = {
        email,
        tempPin,
        newPassword
    };
    await http(`${config.apiUrl}/users/changepassword`, {
        method: "POST",
        body: JSON.stringify(body)
    });
    return true;
};

export const verify = async (email: string, tempPin: string) => {
    const body: VerifyBody = {
        email,
        tempPin
    };
    await http(`${config.apiUrl}/users/verify`, {
        method: "PUT",
        body: JSON.stringify(body)
    });
    return true;
};

export const verifyStaff = async (email: string, tempPin: string, password: string) => {
    const body: StaffVerifyBody = {
        email,
        tempPin,
        password
    };
    await http(`${config.apiUrl}/users/staff/verify`, {
        method: "PUT",
        body: JSON.stringify(body)
    });
    return true;
};

export const refresh = async (refreshToken: string, oldIdToken: string): Promise<boolean> => {
    try {
        const body: RefreshBody = {
            idToken: oldIdToken,
            refreshToken
        };
        const result = await fetch(`${config.apiUrl}/users/refresh`, {
            method: "POST",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json; charset=utf-8" }
        });
        if (result.status.toString().startsWith("2")) {
            const data = await result.json();
            Object.entries(data).map(([key, value]) => {
                if (value && typeof value === "object") {
                    localStorage.setItem(key, JSON.stringify(value));
                } else {
                    localStorage.setItem(key, `${value}`);
                }
            });
            return true;
        } else {
            const data = await result.json();
            if (data.name === new NonAuthorizedError().name) {
                clearCredentials();
                window.location.reload();
            }
        }
    } catch (e) {
        return false;
    }
    return false;
};