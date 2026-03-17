import * as React from "react";
import { useTranslate } from "react-admin";
import { AsideController } from "../../components";

export const BusinessAside = () => {
    const translate = useTranslate();
    return (
        <AsideController
            source="businesses"
            searchPlaceholder={translate(`resources.businesses.searchAside`, { smart_count: 1, })}
            addButtonText={translate(`resources.businesses.addNewBusiness`, { smart_count: 1, })}
        />
    );
};