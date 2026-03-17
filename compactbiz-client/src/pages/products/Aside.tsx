import * as React from "react";
import { AsideController } from "../../components";
import { useTranslate } from "react-admin";

export const ProductAside = () => {
    const translate = useTranslate();
    return (
        <AsideController
            source="products"
            searchPlaceholder={translate(`resources.products.searchAside`, { smart_count: 1, })}
            addButtonText={translate(`resources.products.addNewProduct`, { smart_count: 1, })}
        />
    );
};