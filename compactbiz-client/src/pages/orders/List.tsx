import * as React from "react";
import { Datagrid, Empty, FunctionField, TextField, useTranslate } from "react-admin";
import { OrderAside } from "./Aside";
import { BizList } from "../../styledComponents";
import { typed } from "../../util";
import { Order } from "../../../models";
import { Chip } from "@mui/material";
import { OrderStatus } from "../../../models/enums";

const o = typed(Order);

const STATUS_COLOR: Partial<Record<OrderStatus, string>> = {
    [OrderStatus.Temporary]: "#9e9e9e",
    [OrderStatus.Pending]: "#ca8a04",
    [OrderStatus.InProgress]: "#0288d1",
    [OrderStatus.Delivery]: "#7c3aed",
    [OrderStatus.Complete]: "#2e7d32",
    [OrderStatus.Canceled]: "#d32f2f"
};

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
                <FunctionField source={o(x => x.type)} label={translate(`resources.orders.type`, { smart_count: 1, })} render={(record: any) => translate(`resources.misc.${record.type?.toLowerCase()}`, { smart_count: 1 })} />
                <TextField source={o(x => x.total)} label={translate(`resources.orders.total`, { smart_count: 1, })} />
                <TextField source={o(x => x.business.name)} label={translate(`resources.orders.business.name`, { smart_count: 1, })} sortable={false} />
                <FunctionField
                    source={o(x => x.status)}
                    label={translate(`resources.orders.status`, { smart_count: 1 })}
                    render={(record: Order) => (
                        <Chip
                            label={record.status}
                            size="small"
                            sx={{
                                bgcolor: STATUS_COLOR[record.status] ?? "default",
                                color: STATUS_COLOR[record.status] ? "white" : undefined,
                                fontWeight: 500
                            }}
                        />
                    )}
                />
            </Datagrid>
        </BizList>
    );
};
