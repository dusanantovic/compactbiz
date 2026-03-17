import { Business } from "../../../models";
import { Address } from "../../../models/src/address";
import * as React from "react";
import { Create, Edit, TabbedForm, TextInput, NumberInput, useTranslate } from "react-admin";
import { typed } from "../../util";

const b = typed(Business);
const a = typed(Address, "address");

const BusinessForm = ({ ...props }) => {
    const translate = useTranslate();
    return (
        <TabbedForm {...props} defaultValues={{ address: {} }}>
            <TabbedForm.Tab label={translate(`resources.misc.data`, { smart_count: 1, })}>
                <TextInput source={b(x => x.name)} label={translate(`resources.misc.name`, { smart_count: 1, })} />
                <TextInput source={a(x => x.country)} label={translate(`resources.misc.country`)} />
                <TextInput source={a(x => x.city)} label={translate(`resources.misc.city`)} />
                <TextInput source={a(x => x.street)} label={translate(`resources.misc.street`)} />
                <TextInput source={a(x => x.streetNumber)} label={translate(`resources.misc.streetNumber`)} />
                <NumberInput source={a(x => x.zip)} label={translate(`resources.misc.zip`)} />
            </TabbedForm.Tab>
        </TabbedForm>
    );
};

export const BusinessCreate = () => (
    <Create>
        <BusinessForm />
    </Create>
);

export const BusinessEdit = () => (
    <Edit>
        <BusinessForm />
    </Edit>
);