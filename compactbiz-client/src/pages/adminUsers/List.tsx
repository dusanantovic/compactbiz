import * as React from "react";
import { BooleanField, Datagrid, Empty, SelectField, TextField, useTranslate } from "react-admin";
import { BizList } from "../../styledComponents";
import { AdminUserAside } from "./Aside";

export const AdminUserList = () => {
    const translate = useTranslate();
    return (
        <BizList
            title="Users"
            aside={<AdminUserAside />}
            actions={false}
            empty={<Empty hasCreate={false} />}
        >
            <Datagrid bulkActionButtons={false}>
                <TextField source="id" label="#ID" />
                <TextField source="email" label="Email" />
                <TextField source="firstName" label={translate("resources.misc.firstName", { smart_count: 1 })} />
                <TextField source="lastName" label={translate("resources.misc.lastName", { smart_count: 1 })} />
                <TextField source="phone" label={translate("resources.misc.phone", { smart_count: 1 })} />
                <SelectField source="role" label={translate("resources.misc.role", { smart_count: 1 })} choices={[
                    { id: 2, name: translate("resources.misc.warehouseman", { smart_count: 1 }) },
                    { id: 4, name: translate("resources.misc.driver", { smart_count: 1 }) },
                    { id: 8, name: translate("resources.misc.cashier", { smart_count: 1 }) },
                    { id: 14, name: translate("resources.misc.sales", { smart_count: 1 }) },
                    { id: 16, name: translate("resources.misc.inventoryManager", { smart_count: 1 }) },
                    { id: 512, name: translate("resources.misc.manager", { smart_count: 1 }) },
                    { id: 2048, name: translate("resources.misc.owner", { smart_count: 1 }) },
                    { id: 4096, name: "Admin" },
                ]} />
                <TextField source="employeedById" label={translate("resources.misc.company", { smart_count: 1 })} />
                <BooleanField source="verified" label={translate("resources.misc.verified", { smart_count: 1 })} />
            </Datagrid>
        </BizList>
    );
};
