import * as React from "react";
import { useTranslate } from "react-admin";
import { AsideController } from "../../components";

export const BrandAside = () => {
    const translate = useTranslate();
    return (
        <AsideController
            source="brands"
            searchPlaceholder={translate(`resources.brands.searchAside`, { smart_count: 1, })}
            addButtonText={translate(`resources.brands.addNewBrand`, { smart_count: 1, })}
        />
    );
};