import * as React from "react";
import { useTranslate } from "react-admin";
import { AsideController } from "../../components";

export const UserAside = () => {
    const translate = useTranslate();
    return (
        <AsideController
            source="users/staff"
            searchPlaceholder={translate(`resources.staff.searchAside`, { smart_count: 1, })}
            addButtonText={translate(`resources.staff.addNewStaffMember`, { smart_count: 1, })}
        />
    );
};