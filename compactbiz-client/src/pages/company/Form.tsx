import { Company } from "../../../models";
import { Address } from "../../../models/src/address";
import * as React from "react";
import { Create, DeleteButton, Edit, NumberInput, SaveButton, SelectInput, TabbedForm, TextInput, Toolbar, useTranslate } from "react-admin";
import { useLocation } from "react-router-dom";
import { Divider, Grid, Typography } from "@mui/material";
import { typed } from "../../util";
import { FormField } from "../../components";

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
                <Grid container spacing={2} sx={{ width: "100%" }}>
                    <Grid item xs={12} sm={6}>
                        <FormField>
                            <TextInput source={c(x => x.name)} label={translate(`resources.misc.name`, { smart_count: 1 })} />
                        </FormField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormField>
                            <TextInput source={c(x => x.email)} label={translate(`resources.misc.email`, { smart_count: 1 })} />
                        </FormField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormField>
                            <SelectInput
                                source={c(x => x.status)}
                                label={translate(`resources.misc.status`, { smart_count: 1 })}
                                choices={[
                                    { id: "Active", name: translate(`resources.misc.active`, { smart_count: 1 }) },
                                    { id: "Paused", name: translate(`resources.misc.paused`, { smart_count: 1 }) },
                                    { id: "Inactive", name: translate(`resources.misc.inactive`, { smart_count: 1 }) },
                                    { id: "Demo", name: "Demo" }
                                ]}
                            />
                        </FormField>
                    </Grid>
                    <Grid item xs={12}>
                        <Divider sx={{ mt: 1 }} />
                        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 600, color: "#64748b" }}>
                            {translate(`resources.misc.address`)}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormField>
                            <TextInput source={a(x => x.country)} label={translate(`resources.misc.country`)} />
                        </FormField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormField>
                            <TextInput source={a(x => x.city)} label={translate(`resources.misc.city`)} />
                        </FormField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormField>
                            <TextInput source={a(x => x.street)} label={translate(`resources.misc.street`)} />
                        </FormField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormField>
                            <TextInput source={a(x => x.streetNumber)} label={translate(`resources.misc.streetNumber`)} />
                        </FormField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormField>
                            <NumberInput source={a(x => x.zip)} label={translate(`resources.misc.zip`)} />
                        </FormField>
                    </Grid>
                </Grid>
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
