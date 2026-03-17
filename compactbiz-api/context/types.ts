import { Company, User } from "../models";

export interface Context {
    query: ContextQuery;
    state: ContextState;
}

export interface ContextState {
    user?: User;
    company?: Company;
    facilityId?: number;
}

type ContextQuery = { [key: string]: undefined | string | string[] | ContextQuery | ContextQuery[] };