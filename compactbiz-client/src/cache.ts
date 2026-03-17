import { Role } from "models/enums";

interface Context {
    email: string;
    name: string;
    userId: number | null;
    companyId: number | null;
    role: Role | null;
}

export const context: Context = {
    email: "",
    name: "",
    userId: null,
    companyId: null,
    role: null
};

export const initCache = () => {
    context.email = localStorage.getItem("email") || "";
    context.name = localStorage.getItem("name") || "";
    context.userId = parseInt(localStorage.getItem("userId") || "0") || null;
    context.companyId = parseInt(localStorage.getItem("companyId") || "0") || null;
    context.role = parseInt(localStorage.getItem("role") || "0") || null;
};

export const clearCredentials = () => {
    localStorage.removeItem("idToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("facilityId");
    localStorage.removeItem("facilities");
};