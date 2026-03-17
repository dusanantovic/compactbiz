import * as React from "react";
import { AsideController } from "../../components";
import { useTranslate } from "react-admin";

export const CompanyAside = () => {
    const translate = useTranslate();
    return (
        <AsideController
            source="companies"
            searchPlaceholder={translate(`resources.companies.searchAside`, { smart_count: 1, })}
            addButtonText={translate(`resources.companies.addNewCompany`, { smart_count: 1, })}
        />
    );
};