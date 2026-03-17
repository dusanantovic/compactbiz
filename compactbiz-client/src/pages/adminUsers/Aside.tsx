import * as React from "react";
import { useTranslate } from "react-admin";
import { AsideController } from "../../components";

export const AdminUserAside = () => {
    const translate = useTranslate();
    return (
        <AsideController
            source="adminstaff"
            searchPlaceholder={translate(`resources.adminstaff.searchAside`, { smart_count: 1 })}
            addButtonText={translate(`resources.adminstaff.addNewUser`, { smart_count: 1 })}
        />
    );
};
