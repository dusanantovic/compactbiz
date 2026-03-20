import * as React from "react";
import { useState, useEffect } from "react";
import { ArrayField, Create, Datagrid, Edit, FunctionField, ListContextProvider, TabbedForm, TextField, TextInput, useList, useRecordContext, useTranslate } from "react-admin";
import { Grid } from "@mui/material";
import { typed } from "../../util";
import { AsyncSelectInput, FormField } from "../../components";
import { useLocation } from "react-router-dom";
import { Product, ProductPrice } from "models";
import { http } from "../../http";
import { buildHttpUrl } from "../../httpDataProvider";

const p = typed(Product);
const pp = typed(ProductPrice);

const HistoryTab = () => {
    const record = useRecordContext();
    const [history, setHistory] = useState<any[]>([]);
    const listContext = useList({ data: history });

    useEffect(() => {
        if (!record?.id) return;
        void http(buildHttpUrl(`products/${record.id}/history`))
            .then(res => setHistory(res.json));
    }, [record?.id]);

    return (
        <ListContextProvider value={listContext}>
            <Datagrid bulkActionButtons={false} sx={{ width: "100%" }}>
                <TextField source="id" label="#ID" />
                <TextField source="type" label="Type" />
                <TextField source="delta" label="Delta" />
                <TextField source="business.name" label="Business" />
                <FunctionField source="orderId" label="Order ID" render={(record: any) =>
                    record.orderId
                        ? <a href={`#/orders/${record.companyId}-${record.facilityId}-${record.businessId}-${record.orderId}`}>{record.companyId}-{record.facilityId}-{record.businessId}-{record.orderId}</a>
                        : null
                } />
                <TextField source="note" label="Note" />
            </Datagrid>
        </ListContextProvider>
    );
};

const ProductForm = ({ ...props }) => {
    const translate = useTranslate();
    const location = useLocation();
    return (
        <TabbedForm {...props}>
            <TabbedForm.Tab label={translate(`resources.misc.data`, { smart_count: 1, })}>
                <Grid container spacing={2} sx={{ width: "100%" }}>
                    <Grid item xs={12} sm={6}>
                        <FormField>
                            <TextInput source={p(x => x.name)} label={translate(`resources.misc.name`, { smart_count: 1 })} />
                        </FormField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormField>
                            <AsyncSelectInput
                                resource="brands"
                                source={p(x => x.brandId)}
                                label={translate(`resources.misc.brand`, { smart_count: 1 })}
                            />
                        </FormField>
                    </Grid>
                </Grid>
            </TabbedForm.Tab>
            {location.pathname !== "/products/create" &&
                (
                    <TabbedForm.Tab label={translate(`resources.misc.price`, { smart_count: 1, })}>
                        <ArrayField source="prices" sx={{ width: "100%" }}>
                            <Datagrid bulkActionButtons={false} sx={{ width: "100%" }}>
                                <TextField source={pp(x => x.id)} label="#ID" />
                                <TextField source="business.name" label={translate(`resources.misc.business`, { smart_count: 1, })} />
                                <TextField source={pp(x => x.price)} label={translate(`resources.misc.lastPrice`, { smart_count: 1, })} />
                                <TextField source={pp(x => x.type)} label={translate(`resources.misc.type`, { smart_count: 1, })} />
                            </Datagrid>
                        </ArrayField>
                    </TabbedForm.Tab>
                )
            }
            {location.pathname !== "/products/create" &&
                (
                    <TabbedForm.Tab label={translate(`resources.misc.history`, { smart_count: 1, })}>
                        <HistoryTab />
                    </TabbedForm.Tab>
                )
            }
        </TabbedForm>
    );
};

export const ProductCreate = () => (
    <Create>
        <ProductForm />
    </Create>
);

export const ProductEdit = () => (
    <Edit>
        <ProductForm />
    </Edit>
);
