import { User } from "../../../models";
import * as React from "react";
import { Create, Edit, SelectInput, TabbedForm, TextInput, useTranslate } from "react-admin";
import { Role } from "models/enums";
import { typed, getEnumEntries } from "../../util";

const f = typed(User);

const excludedRoles = new Set<Role>([Role.Guest, Role.Admin]);

const UserForm = ({ ...props }) => {
    const translate = useTranslate();

    const roleChoices = getEnumEntries(Role as any)
        .filter(({ id }) => !excludedRoles.has(id as any))
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
            </TabbedForm.Tab>
        </TabbedForm>
    );
};

export const UserCreate = () => (
    <Create resource="users/staff">
        <UserForm />
    </Create>
);

export const UserEdit = () => (
    <Edit>
        <UserForm />
    </Edit>
);