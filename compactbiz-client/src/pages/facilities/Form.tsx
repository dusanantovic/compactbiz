import { Facility } from "../../../models";
import * as React from "react";
import { Create, Edit, TabbedForm, TextInput, useTranslate } from "react-admin";
import { Grid } from "@mui/material";
import { typed } from "../../util";
import { FormField } from "../../components";

const f = typed(Facility);

const FacilityForm = ({ ...props }) => {
    const translate = useTranslate();
    return (
        <TabbedForm {...props}>
            <TabbedForm.Tab label={translate(`resources.misc.data`, { smart_count: 1, })}>
                <Grid container spacing={2} sx={{ width: "100%" }}>
                    <Grid item xs={12} sm={6}>
                        <FormField>
                            <TextInput source={f(x => x.name)} label={translate(`resources.misc.name`, { smart_count: 1 })} />
                        </FormField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormField>
                            <TextInput source={f(x => x.email)} label={translate(`resources.misc.email`, { smart_count: 1 })} />
                        </FormField>
                    </Grid>
                </Grid>
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
