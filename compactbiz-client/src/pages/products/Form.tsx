import * as React from "react";
import { useState, useEffect } from "react";
import { ArrayField, Create, Datagrid, Edit, FunctionField, ListContextProvider, NumberInput, SelectInput, TabbedForm, TextField, TextInput, useList, useRecordContext, useTranslate } from "react-admin";
import { typed } from "../../util";
import { AsyncSelectInput } from "../../components";
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
        http(buildHttpUrl(`products/${record.id}/history`))
            .then(res => setHistory(res.json));
    }, [record?.id]);

    return (
        <ListContextProvider value={listContext}>
            <Datagrid bulkActionButtons={false}>
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
                <TextInput source={p(x => x.name)} label={translate(`resources.misc.name`, { smart_count: 1, })} />
                <SelectInput
                    source={p(x => x.type)}
                    label={translate(`resources.misc.type`, { smart_count: 1, })}
                    choices={[
                        { id: "Purchase", name: translate(`resources.misc.purchase`, { smart_count: 1, }) },
                        { id: "Sell", name: translate(`resources.misc.sell`, { smart_count: 1, }) },
                        { id: "Both", name: translate(`resources.misc.both`, { smart_count: 1, }) }
                    ]}
                />
                <AsyncSelectInput
                    resource="brands"
                    source={p(x => x.brandId)}
                />
                <NumberInput source={p(x => x.defaultPrice)} label={translate(`resources.misc.price`, { smart_count: 1, })} />
                <NumberInput source={p(x => x.quantity)} label={translate(`resources.misc.quantity`, { smart_count: 1, })} />
            </TabbedForm.Tab>
            {location.pathname !== "/products/create" &&
                (
                    <TabbedForm.Tab label={translate(`resources.misc.price`, { smart_count: 1, })}>
                        <ArrayField source="prices">
                            <Datagrid bulkActionButtons={false}>
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