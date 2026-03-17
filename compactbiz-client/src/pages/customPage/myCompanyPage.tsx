import * as React from "react";
import { EditContextProvider, NumberInput, SimpleForm, TextInput, Title, useEditController, useTranslate } from "react-admin";
import { CardContent } from "@mui/material";
import { typed } from "src/util";
import { Company } from "models";
import { Address } from "models/src/address";
import { context } from "../../cache";

export const MyCompanyPage = () => {
    return (
        <div>
            <Title title="My Company" />
            <CardContent>
                <CompanyForm />
            </CardContent>
        </div>
    );
};

const c = typed(Company);
const a = typed(Address, "address");

const CompanyForm = () => {
    const translate = useTranslate();
    const editControllerProps = useEditController({ resource: "companies", id: context.companyId, redirect: false });

    if (editControllerProps.isPending) return <>Loading...</>;
    return (
        <EditContextProvider value={editControllerProps}>
            <SimpleForm>
                <TextInput source={c(x => x.name)} label={translate(`resources.misc.name`, { smart_count: 1, })} />
                <TextInput source={c(x => x.email)} />
                <TextInput source={a(x => x.country)} label={translate(`resources.misc.country`)} />
                <TextInput source={a(x => x.city)} label={translate(`resources.misc.city`)} />
                <TextInput source={a(x => x.street)} label={translate(`resources.misc.street`)} />
                <TextInput source={a(x => x.streetNumber)} label={translate(`resources.misc.streetNumber`)} />
                <NumberInput source={a(x => x.zip)} label={translate(`resources.misc.zip`)} />
            </SimpleForm>
        </EditContextProvider>
    );
};
MyCompanyPage.path = "/myCompany";