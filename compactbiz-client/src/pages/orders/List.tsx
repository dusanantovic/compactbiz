import * as React from "react";
import { Datagrid, Empty, TextField, useTranslate } from "react-admin";
import { OrderAside } from "./Aside";
import { BizList } from "../../styledComponents";
import { typed } from "../../util";
import { Order } from "../../../models";

const o = typed(Order);

export const OrderList = () => {
    const translate = useTranslate();
    return (
        <BizList
            title="Orders"
            aside={<OrderAside />}
            actions={false}
            empty={<Empty hasCreate={false} />}
        >
            <Datagrid>
                <TextField source={o(x => x.id)} label="#ID" />
                <TextField source={o(x => x.type)} label={translate(`resources.orders.type`, { smart_count: 1, })} />
                <TextField source={o(x => x.total)} label={translate(`resources.orders.total`, { smart_count: 1, })} />
                <TextField source={o(x => x.business.name)} label={translate(`resources.orders.business.name`, { smart_count: 1, })} sortable={false} />
                <TextField source={o(x => x.status)} label={translate(`resources.orders.status`, { smart_count: 1, })} />
                {/* <TextField sortable={false} source={o(x => x.quantity)} label={translate(`resources.misc.quantity`, { smart_count: 1, })} /> */}
            </Datagrid>
        </BizList>
    );
};