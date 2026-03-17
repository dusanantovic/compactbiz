import { CompanyStatus, Role } from "./models/enums";
import { throwError } from "./models/src/util";
import { Action, ForbiddenError } from "routing-controllers";
import { ContextState } from "./context";

const rolesWithoutFacility = [Role.Owner];

export const authorizationRoleChecker = (action: Action, roles: number[]): boolean => {
    const { user, company } = action.request.context.state as ContextState;
    if (user) {
        const isAdmin = user.role === Role.Admin;
        if (isAdmin || (company && user.employeedById === company.id && company.status !== CompanyStatus.Inactive)) {
            const userRoleMatchesRequiredRole = isAdmin || roles.some(role => role === user.role);
            if (userRoleMatchesRequiredRole) {
                const existInRoleWithoutFacilityId = isAdmin || rolesWithoutFacility.some(role => role === user.role);
                const urlParams = new URLSearchParams(action.request.url.split('?')[1] || '');
                const facilityId: number = parseInt(urlParams.get('facilityId') || '');
                if (existInRoleWithoutFacilityId || facilityId) {
                    let useHasAccess = existInRoleWithoutFacilityId;
                    if (!existInRoleWithoutFacilityId && company) {
                        useHasAccess = user.facilities.some(x => x.id === facilityId && x.companyId === company.id);
                    }
                    if (useHasAccess) {
                        return true;
                    }
                }
            }
        }
    }
    throwError(["You are not authorized to perform this operation"], ForbiddenError);
};