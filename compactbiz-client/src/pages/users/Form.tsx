import { User } from "../../../models";
import * as React from "react";
import { Create, Edit, SelectInput, TabbedForm, TextInput, useTranslate } from "react-admin";
import { Role } from "models/enums";
import { typed, getEnumEntries } from "../../util";

const f = typed(User);

const excludedRoles = new Set<Role>([Role.Guest, Role.Admin]);

const UserForm = ({ ...props }) => {
    const translate = useTranslate();

    const roleChoices = getEnumEntries(Role)
        .filter(({ id }) => !excludedRoles.has(id as Role))
        .map(({ id, name }) => ({
            id,
            name: translate(`resources.misc.${(name as string).replace(/^(.)/, c => c.toLowerCase()).replace(" ", "")}`),
        }));

    return (
        <TabbedForm {...props}>
            <TabbedForm.Tab label={translate(`resources.misc.data`, { smart_count: 1, })}>
                <TextInput source={f(x => x.firstName)} label={translate(`resources.misc.firstName`, { smart_count: 1, })} />
                <TextInput source={f(x => x.lastName)} label={translate(`resources.misc.lastName`, { smart_count: 1, })} />
                <TextInput source={f(x => x.phone)} label={translate(`resources.misc.phone`, { smart_count: 1, })} />
                <TextInput source={f(x => x.email)} />
                <SelectInput source={f(x => x.role)} label={translate(`resources.misc.role`, { smart_count: 1, })} choices={roleChoices} />
                <TextInput source={f(x => x.password)} label={translate(`resources.misc.password`, { smart_count: 1, })} />
            </TabbedForm.Tab>
        </TabbedForm>
    );
};

export const UserCreate = () => (
    <Create>
        <UserForm />
    </Create>
);

export const UserEdit = () => (
    <Edit>
        <UserForm />
    </Edit>
);