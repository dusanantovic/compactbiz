import { AuthProvider } from "react-admin";
import { clearCredentials, context, initCache } from "./cache";
import { http } from "./http";
import { config } from "./config";
import { login } from "./authClient";

initCache();

export const authProvider: AuthProvider = {
    // called when the user attempts to log in
    login: async ({ email, password }) => {
        await login(email, password);
        return Promise.resolve();
    },
    // called when the user clicks on the logout button
    logout: async () => {
        const idToken = localStorage.getItem("idToken");
        if (idToken) {
            try {
                await http(`${config.apiUrl}/users/logout`, {
                    method: "POST"
                });
                void clearCredentials();
            } catch (err: any) {
                void clearCredentials();
                window.location.reload();
            }
        }
        return Promise.resolve();
    },
    // called when the API returns an error
    checkError: ({ status }: { status: number }) => {
        if (status === 401) {
            //
        }
        return Promise.resolve();
    },
    // called when the user navigates to a new location, to check for authentication
    checkAuth: () => {
        if (!context.userId) {
            return Promise.reject();
        }
        return localStorage.getItem("idToken") ? Promise.resolve() : Promise.reject();
    },
    // called when the user navigates to a new location, to check for permissions / roles
    getPermissions: () => Promise.resolve(context.role),
};
