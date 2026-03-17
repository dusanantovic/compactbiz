import * as React from "react";
import { Datagrid, Empty, TextField, useTranslate } from "react-admin";
import { BusinessAside } from "./Aside";
import { BizList } from "../../styledComponents";

export const BusinessList = () => {
    const translate = useTranslate();
    return (<BizList
        title="Business"
        aside={<BusinessAside />}
        actions={false}
        empty={<Empty hasCreate={false} />}
    >
        <Datagrid>
            <TextField source="id" label="#ID" />
            <TextField source="name" label={translate(`resources.misc.name`, { smart_count: 1, })} />
        </Datagrid>
    </BizList>);
};