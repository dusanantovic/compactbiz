import * as React from "react";
import { AsideController } from "../../components";
import { usePermissions, useTranslate } from "react-admin";
import { Role } from "../../../models/enums";

export const OrderAside = () => {
    const translate = useTranslate();
    const { permissions } = usePermissions();
    return (
        <AsideController
            source="orders"
            searchPlaceholder={translate(`resources.orders.searchAside`, { smart_count: 1, })}
            addButtonText={permissions !== Role.Warehouseman ? translate(`resources.orders.addNewProduct`, { smart_count: 1, }) : undefined}
        />
    );
};