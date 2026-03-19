import { Business, Order } from "../../../models";
import { Address } from "../../../models/src/address";
import * as React from "react";
import { Create, Datagrid, Edit, ListContextProvider, NumberInput, Pagination, TabbedForm, TextField, TextInput, useGetList, useList, useRecordContext, useTranslate } from "react-admin";
import { Divider, Grid, Typography } from "@mui/material";
import { typed } from "../../util";
import { FormField } from "../../components";

const b = typed(Business);
const a = typed(Address, "address");

const BusinessOrdersTab = () => {
    const record = useRecordContext<Business>();
    const translate = useTranslate();
    const [page, setPage] = React.useState(1);
    const perPage = 10;

    const businessId = record?.id
        ? parseInt(record.id.toString().split('-').pop()!)
        : undefined;

    const { data = [], total = 0, isPending, isFetching } = useGetList<Order>(
        'orders',
        {
            pagination: { page, perPage },
            sort: { field: 'id', order: 'DESC' },
            filter: { businessId },
        },
        { enabled: !!businessId }
    );

    const listContext = useList({ data, isPending, isFetching });

    const contextValue = {
        ...listContext,
        page,
        perPage,
        total,
        setPage: (p: number) => setPage(p),
        totalPages: Math.ceil((total || 0) / perPage),
        hasNextPage: page * perPage < (total || 0),
        hasPreviousPage: page > 1,
        resource: 'orders',
    };

    return (
        <ListContextProvider value={contextValue as any}>
            <Datagrid bulkActionButtons={false} sx={{ width: "100%" }}>
                <TextField source="id" label="#ID" />
                <TextField source="type" label={translate('resources.orders.type', { smart_count: 1 })} />
                <TextField source="total" label={translate('resources.orders.total', { smart_count: 1 })} />
                <TextField source="status" label={translate('resources.orders.status', { smart_count: 1 })} />
            </Datagrid>
            <Pagination rowsPerPageOptions={[10]} />
        </ListContextProvider>
    );
};

const BusinessForm = (props: any) => {
    const { showOrders = false, ...rest } = props;
    const translate = useTranslate();
    return (
        <TabbedForm {...rest} defaultValues={{ address: {} }}>
            <TabbedForm.Tab label={translate(`resources.misc.data`, { smart_count: 1, })}>
                <Grid container spacing={2} sx={{ width: "100%" }}>
                    <Grid item xs={12} sm={8}>
                        <FormField>
                            <TextInput source={b(x => x.name)} label={translate(`resources.misc.name`, { smart_count: 1 })} />
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
            {showOrders && (
                <TabbedForm.Tab label={translate('resources.orders.name', { smart_count: 2 })}>
                    <BusinessOrdersTab />
                </TabbedForm.Tab>
            )}
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
        <BusinessForm showOrders />
    </Edit>
);
