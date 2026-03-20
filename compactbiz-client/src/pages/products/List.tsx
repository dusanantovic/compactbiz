import * as React from "react";
import { Datagrid, Empty, TextField, useTranslate } from "react-admin";
import { ProductAside } from "./Aside";
import { BizList } from "../../styledComponents";
import { typed } from "../../util";
import { Product } from "../../../models";

const p = typed(Product);

export const ProductList = () => {
    const translate = useTranslate();
    return (
        <BizList
            title="Products"
            aside={<ProductAside />}
            actions={false}
            empty={<Empty hasCreate={false} />}
        >
            <Datagrid>
                <TextField source={p(x => x.id)} label="#ID" />
                <TextField source={p(x => x.name)} label={translate(`resources.misc.name`, { smart_count: 1, })} />
                <TextField source={p(x => x.brand.name)} label={translate(`resources.brands.name`, { smart_count: 1, })} />
                <TextField source={p(x => x.type)} label={translate(`resources.misc.type`, { smart_count: 1, })} />
                <TextField source={p(x => x.defaultPrice)} label={translate(`resources.misc.price`, { smart_count: 1, })} />
                <TextField sortable={false} source={p(x => x.quantity)} label={translate(`resources.misc.quantity`, { smart_count: 1, })} />
                <TextField sortable={false} source={p(x => x.reserved)} label={translate(`resources.misc.reserved`, { smart_count: 1, })} />
            </Datagrid>
        </BizList>
    );
};