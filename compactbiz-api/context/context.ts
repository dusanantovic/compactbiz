import { NextFunction, Request, Response } from "express";
import { decode as jwtDecode } from "jsonwebtoken";
import { IdTokenData } from "../models/interfaces";
import { Company, Facility, NonAuthorizedError, User } from "../models";
import { throwError } from "../models/src/util";
import { ForbiddenError, createParamDecorator } from "routing-controllers";
import { Context } from "./types";
import { DBConnection } from "../dbConnection";
import { CompanyRepository, RepositoryProvider, UserRepository } from "../src/repositories";
import { RouteList, matchRoutesPathAndMethod } from "../matchPathAndMethod";

const withoutUserList: RouteList[] = [
    { path: "/api/users", method: "POST" },
    { path: "/api/users/login", method: "POST" },
    { path: "/api/users/refresh", method: "POST" },
    { path: "/api/users/sendtemppin", method: "POST" },
    { path: "/api/users/changepassword", method: "POST" },
    { path: "/api/users/verify", method: "PUT" },
    { path: "/api/users/staff/verify", method: "PUT" },
];

const withoutCompanyList: RouteList[] = [
    ...withoutUserList,
    { path: "/api/users/logout", method: "POST" },
    { path: "/api/companies", method: "POST" }
];

export const setContext = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const userIsRequired = !matchRoutesPathAndMethod(request.path, request.method, withoutUserList);
    const companyIsRequired = !matchRoutesPathAndMethod(request.path, request.method, withoutCompanyList);
    setContextDataFromRequest(request);
    let callNext = true;
    if (userIsRequired) {
        callNext = await setContextUser(request, next);
    }
    if (callNext && companyIsRequired) {
        callNext = await setContextCompanyAndFacilityId(request, next);
    }
    if (callNext) {
        next();
    }
};

const setContextDataFromRequest = (request: Request): void => {
    const context: Context = {
        query: request.query,
        state: {
            user: undefined,
            company: undefined
        }
    };
    (request as any).context = context;
};

const setContextUser = async (request: Request, next: NextFunction): Promise<boolean> => {
    const connection = DBConnection.getConnection();
    const repositoryProvider = new RepositoryProvider(connection.manager);
    const userRepo = repositoryProvider.getCustomRepository(User, UserRepository);
    try {
        const user = await getCurrentUserFromToken(request, userRepo);
        const context: Context = (request as any).context;
        context.state.user = user;
        (request as any).context = context;
        return true;
    } catch (err: any) {
        next(err);
        return false;
    }
};

const setContextCompanyAndFacilityId = async (request: Request, next: NextFunction): Promise<boolean> => {
    const connection = DBConnection.getConnection();
    const repositoryProvider = new RepositoryProvider(connection.manager);
    const companyRepo = repositoryProvider.getCustomRepository(Company, CompanyRepository);
    try {
        const path = request.get("Referrer") || request.get("origin") || request.get("host");
        if (!path) {
            throwError(["Unknown compay"], ForbiddenError);
        }
        const context: Context = (request as any).context;
        if (!context.state.user || !context.state.user.employeedById) {
            throwError(["You dont have access to this company"], ForbiddenError);
        }
        const company = await companyRepo.getById(context.state.user.employeedById, ["facilities"]);
        let facilityId: number | undefined = undefined;
        if (request.query.facilityId) {
            facilityId = parseInt(request.query.facilityId as string);
            if (!company.facilities || company.facilities.length === 0 || !company.facilities.map((f: Facility) => f.id).includes(facilityId)) {
                throwError([`Unknown facility ${facilityId}`], ForbiddenError);
            }
            delete request.query.facilityId;
        }
        context.state.company = company;
        context.state.facilityId = facilityId;
        (request as any).context = context;
        return true;
    } catch (err: any) {
        next(err);
        return false;
    }
};

const getCurrentUserFromToken = async (request: Request, userRepo: UserRepository): Promise<User> => {
    if (request.headers.authorization) {
        try {
            const idToken = request.headers.authorization.replace("Bearer ", "");
            if (idToken) {
                User.verifyIdToken(idToken);
                const idTokenData = (jwtDecode(idToken) as unknown) as IdTokenData;
                if (idTokenData.userId && idTokenData.email) {
                    const user = await userRepo.findOne({
                        where: {
                            id: idTokenData.userId,
                            verified: true
                        },
                        relations: ["facilities"]
                    });
                    if (user) {
                        return user;
                    }
                }
            }
        } catch (err: any) {
            if (err.message) {
                throw err;
            }
        }
    }
    throw new NonAuthorizedError();
};

export function AppCtx(options?: { required?: boolean }): (object: object, method: string, index: number) => void {
    return createParamDecorator({
        required: options && options.required ? true : false,
        value: action => {
            return action.request.context;
        }
    });
}