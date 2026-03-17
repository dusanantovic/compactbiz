import { Facility } from "../../../models";
import * as React from "react";
import { Create, Edit, TabbedForm, TextInput, useTranslate } from "react-admin";
import { typed } from "../../util";

const f = typed(Facility);

const FacilityForm = ({ ...props }) => {
    const translate = useTranslate();
    return (
        <TabbedForm {...props}>
            <TabbedForm.Tab label={translate(`resources.misc.data`, { smart_count: 1, })}>
                <TextInput source={f(x => x.name)} label={translate(`resources.misc.name`, { smart_count: 1, })} />
                <TextInput source={f(x => x.email)} />
            </TabbedForm.Tab>
        </TabbedForm>
    );
};

export const FacilityCreate = () => (
    <Create>
        <FacilityForm />
    </Create>
);

export const FacilityEdit = () => (
    <Edit>
        <FacilityForm />
    </Edit>
);