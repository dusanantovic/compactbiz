import { User } from "../../../models";
import * as React from "react";
import { Create, Edit, SelectInput, TabbedForm, TextInput, useTranslate } from "react-admin";
import { Button, Grid } from "@mui/material";
import { useFormContext } from "react-hook-form";
import { Role } from "models/enums";
import { typed, getEnumEntries } from "../../util";
import { FormField } from "../../components";

const randomDigits = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
const randomLetters = (n: number) => Array.from({ length: n }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join("");

const PrefillButton = () => {
    const { setValue } = useFormContext();
    const handlePrefill = () => {
        setValue("phone", `+${randomDigits(12)}`);
        setValue("email", `${randomLetters(12)}ceda@yopmail.com`);
    };
    return (
        <Button type="button" variant="outlined" size="small" onClick={handlePrefill} sx={{ mb: 1 }}>
            Prefill phone &amp; email
        </Button>
    );
};

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
                <Grid container spacing={2} sx={{ width: "100%" }}>
                    <Grid item xs={12} sm={6}>
                        <FormField>
                            <TextInput source={f(x => x.firstName)} label={translate(`resources.misc.firstName`, { smart_count: 1 })} />
                        </FormField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormField>
                            <TextInput source={f(x => x.lastName)} label={translate(`resources.misc.lastName`, { smart_count: 1 })} />
                        </FormField>
                    </Grid>
                    <Grid item xs={12}>
                        <PrefillButton />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormField>
                            <TextInput source={f(x => x.phone)} label={translate(`resources.misc.phone`, { smart_count: 1 })} />
                        </FormField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormField>
                            <TextInput source={f(x => x.email)} label={translate(`resources.misc.email`, { smart_count: 1 })} />
                        </FormField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormField>
                            <SelectInput source={f(x => x.role)} label={translate(`resources.misc.role`, { smart_count: 1 })} choices={roleChoices} />
                        </FormField>
                    </Grid>
                </Grid>
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
