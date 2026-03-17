import * as React from "react";
import { AsideController } from "../../components";
import { useTranslate } from "react-admin";

export const FacilityAside = () => {
    const translate = useTranslate();
    return (
        <AsideController
            source="facilities"
            searchPlaceholder={translate(`resources.facilities.searchAside`, { smart_count: 1, })}
            addButtonText={translate(`resources.facilities.addNewFacility`, { smart_count: 1, })}
        />
    );
};