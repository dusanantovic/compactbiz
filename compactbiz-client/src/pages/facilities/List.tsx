import * as React from "react";
import { Datagrid, Empty, TextField, useTranslate } from "react-admin";
import { FacilityAside } from "./Aside";
import { BizList } from "../../styledComponents";

export const FacilityList = () => {
    const translate = useTranslate();
    return (
        <BizList
            title="Facilities"
            aside={<FacilityAside />}
            actions={false}
            empty={<Empty hasCreate={false} />}
        >
            <Datagrid>
                <TextField source="id" label="#ID" />
                <TextField source="name" label={translate(`resources.misc.name`, { smart_count: 1, })} />
            </Datagrid>
        </BizList>
    );
};