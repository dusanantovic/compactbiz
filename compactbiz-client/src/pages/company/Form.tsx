import { Company } from "../../../models";
import { Address } from "../../../models/src/address";
import * as React from "react";
import { Create, DeleteButton, Edit, NumberInput, SaveButton, SelectInput, TabbedForm, TextInput, Toolbar, useTranslate } from "react-admin";
import { useLocation } from "react-router-dom";
import { typed } from "../../util";

const c = typed(Company);
const a = typed(Address, "address");

const CompanyEditToolbar = () => (
    <Toolbar>
        <SaveButton />
        <DeleteButton label="Make Inactive" />
    </Toolbar>
);

const CompanyForm = ({ ...props }) => {
    const translate = useTranslate();
    const location = useLocation();
    const isEdit = location.pathname !== "/companies/create";
    return (
        <TabbedForm {...props} toolbar={isEdit ? <CompanyEditToolbar /> : undefined} defaultValues={{ address: {} }}>
            <TabbedForm.Tab label={translate(`resources.misc.data`, { smart_count: 1, })}>
                <TextInput source={c(x => x.name)} label={translate(`resources.misc.name`, { smart_count: 1, })} />
                <TextInput source={c(x => x.email)} />
                <SelectInput
                    source={c(x => x.status)}
                    choices={[
                        { id: "Active", name: translate(`resources.misc.active`, { smart_count: 1, }) },
                        { id: "Paused", name: translate(`resources.misc.paused`, { smart_count: 1, }) },
                        { id: "Inactive", name: translate(`resources.misc.inactive`, { smart_count: 1, }) },
                        { id: "Demo", name: "Demo" }
                    ]}
                />
                <TextInput source={a(x => x.country)} label={translate(`resources.misc.country`)} />
                <TextInput source={a(x => x.city)} label={translate(`resources.misc.city`)} />
                <TextInput source={a(x => x.street)} label={translate(`resources.misc.street`)} />
                <TextInput source={a(x => x.streetNumber)} label={translate(`resources.misc.streetNumber`)} />
                <NumberInput source={a(x => x.zip)} label={translate(`resources.misc.zip`)} />
            </TabbedForm.Tab>
        </TabbedForm>
    );
};

export const CompanyCreate = () => (
    <Create>
        <CompanyForm />
    </Create>
);

export const CompanyEdit = () => (
    <Edit>
        <CompanyForm />
    </Edit>
);