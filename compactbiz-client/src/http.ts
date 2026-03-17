import { parseUrl, stringify } from "query-string";
import { fetchUtils } from "react-admin";
import { refresh } from "./authClient";
import { clearCredentials } from "./cache";

export const http = async (url: string, options: any = {}) => {
    const idToken = localStorage.getItem("idToken");
    if (!options.headers) {
        options.headers = new Headers({ Accept: "application/json" });
    }
    if (idToken) {
        options.headers.set("Authorization", "Bearer " + idToken);
    }
    const parsedUrl = parseUrl(url);
    const queryParams = stringify(parsedUrl.query);
    url = `${parsedUrl.url}${queryParams ? `?${queryParams}` : ""}`;
    try {
        const response = await fetchUtils.fetchJson(url, options);
        return response;
    } catch (e: any) {
        if (e && e.status === 401) {
            const refreshToken = localStorage.getItem("refreshToken");
            const idToken = localStorage.getItem("idToken");
            if (refreshToken && idToken) {
                const refResult = await refresh(refreshToken, idToken);
                if (refResult) {
                    const newIdToken = localStorage.getItem("idToken");
                    if (newIdToken) {
                        options.headers.set("Authorization", "bearer " + newIdToken);
                    }
                    try {
                        const response = await fetchUtils.fetchJson(url, options);
                        return response;
                    } catch (e2: any) {
                        // Skip
                    }
                } else {
                    clearCredentials();
                    window.location.reload();
                }
            } else {
                clearCredentials();
                window.location.reload();
            }
        }
        const message = errorMessageParser(e.message);
        if (message) {
            if (message.startsWith("duplicate key value violates unique constraint")) {
                e.message = "Entry already exists ";
                if (e.body.detail) {
                    const indicesOpened: number[] = findIndices(e.body.detail, "(");
                    const indicesClosed: number[] = findIndices(e.body.detail, ")");
                    const key = e.body.detail.substring(indicesOpened[0] + 1, indicesClosed[0]).split(", ");
                    const value = e.body.detail.substring(indicesOpened[1] + 1, indicesClosed[1]).split(", ");
                    const map: Record<string, any> = {};
                    for (let i = 0; i < key.length; i++) {
                        map[key[i].replace(/\W/g, "")] = value[i];
                    }
                    const errorArr: string[] = [];
                    for (const keyV of Object.keys(map)) {
                        if (keyV !== "facilityId" && keyV !== "companyId") {
                            errorArr.push(`This ${keyV} already exists: ${map[keyV]}`);
                        }
                    }
                    e.data = map;
                    e.message = errorArr.join();
                }
            } else {
                e.message = message;
            }
        }
        throw e;
    }
};

const findIndices = (str: string, needle: string) => {
    const indices: number[] = [];
    for (let i = 0; i < str.length; i++) {
        if (str[i] === needle) {
            indices.push(i);
        }
    }
    return indices;
};

export const errorMessageParser = (message: string) => {
    if (!message) {
        return "";
    }
    try {
        const messages = JSON.parse(message);
        if (Array.isArray(messages)) {
            return messages.join(". ");
        }
        return message;
    } catch (x: any) {
        return message;
    }
};