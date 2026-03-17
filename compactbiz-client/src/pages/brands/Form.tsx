import { Brand } from "../../../models";
import * as React from "react";
import { Create, Edit, TabbedForm, TextInput, useTranslate } from "react-admin";
import { typed } from "../../util";

const b = typed(Brand);

const BrandForm = ({ ...props }) => {
    const translate = useTranslate();
    return (
        <TabbedForm {...props}>
            <TabbedForm.Tab label={translate(`resources.misc.data`, { smart_count: 1, })}>
                <TextInput source={b(x => x.name)} label={translate(`resources.misc.name`, { smart_count: 1, })} />
            </TabbedForm.Tab>
        </TabbedForm>
    );
};

export const BrandCreate = () => (
    <Create>
        <BrandForm />
    </Create>
);

export const BrandEdit = () => (
    <Edit>
        <BrandForm />
    </Edit>
);