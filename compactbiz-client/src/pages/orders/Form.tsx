import * as React from "react";
import { Order, OrderDetail } from "../../../models";
import { ArrayInput, Create, NumberInput, SelectInput, SimpleFormIterator, TabbedForm, FormDataConsumer, useTranslate, Edit, TextInput, SaveButton, Toolbar, useRecordContext, useNotify, usePermissions, useRedirect } from "react-admin";
import { typed } from "../../util";
import { AsyncSelectInput } from "../../components";
import { Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { OrderStatus, Role } from "../../../models/enums";
import { http } from "../../http";
import { buildHttpUrl } from "../../httpDataProvider";

const o = typed(Order);
const od = typed(OrderDetail);

const SubmitOrderButton = () => {
    const record = useRecordContext<Order>();
    const notify = useNotify();
    const redirect = useRedirect();
    const translate = useTranslate();

    if (!record || record.status !== OrderStatus.Temporary) {
        return null;
    }

    const handleSubmit = async () => {
        try {
            await http(buildHttpUrl(`orders/${record.id}/submit`), { method: "POST" });
            notify(translate("resources.misc.orderSubmitted"), { type: "success" });
            redirect("list", "orders");
        } catch (e: any) {
            notify(e.message ?? "Failed to submit order", { type: "error" });
        }
    };

    return (
        <Button
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            onClick={handleSubmit}
            sx={{ ml: 1 }}
        >
            {translate("resources.misc.submit")}
        </Button>
    );
};

const ReadyToPackButton = () => {
    const record = useRecordContext<Order>();
    const notify = useNotify();
    const redirect = useRedirect();
    const translate = useTranslate();

    if (!record || record.status !== OrderStatus.Pending) {
        return null;
    }

    const handleStart = async () => {
        try {
            await http(buildHttpUrl(`orders/${record.id}/start`), { method: "POST" });
            notify(translate("resources.misc.orderStarted"), { type: "success" });
            redirect("list", "orders");
        } catch (e: any) {
            notify(e.message ?? "Failed to start order", { type: "error" });
        }
    };

    return (
        <Button
            variant="contained"
            color="primary"
            startIcon={<Inventory2Icon />}
            onClick={handleStart}
            sx={{ ml: 1 }}
        >
            {translate("resources.misc.readyToPack")}
        </Button>
    );
};

const ReadyForDeliveryButton = () => {
    const record = useRecordContext<Order>();
    const notify = useNotify();
    const redirect = useRedirect();
    const translate = useTranslate();

    if (!record || record.status !== OrderStatus.InProgress) {
        return null;
    }

    const handleDeliver = async () => {
        try {
            await http(buildHttpUrl(`orders/${record.id}/deliver`), { method: "POST" });
            notify(translate("resources.misc.orderDelivery"), { type: "success" });
            redirect("list", "orders");
        } catch (e: any) {
            notify(e.message ?? "Failed to move order to delivery", { type: "error" });
        }
    };

    return (
        <Button
            variant="contained"
            color="primary"
            startIcon={<LocalShippingIcon />}
            onClick={handleDeliver}
            sx={{ ml: 1 }}
        >
            {translate("resources.misc.readyForDelivery")}
        </Button>
    );
};

const CompleteOrderButton = () => {
    const record = useRecordContext<Order>();
    const notify = useNotify();
    const redirect = useRedirect();
    const translate = useTranslate();

    if (!record || record.status !== OrderStatus.Delivery) {
        return null;
    }

    const handleComplete = async () => {
        try {
            await http(buildHttpUrl(`orders/${record.id}/complete`), { method: "POST" });
            notify(translate("resources.misc.orderCompleted"), { type: "success" });
            redirect("list", "orders");
        } catch (e: any) {
            notify(e.message ?? "Failed to complete order", { type: "error" });
        }
    };

    return (
        <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={handleComplete}
            sx={{ ml: 1 }}
        >
            {translate("resources.misc.complete")}
        </Button>
    );
};

const OrderEditToolbar = () => {
    const { permissions } = usePermissions<Role>();
    const isDriver = permissions === Role.Driver;
    return (
        <Toolbar>
            {!isDriver && <SaveButton />}
            {!isDriver && <SubmitOrderButton />}
            {!isDriver && <ReadyToPackButton />}
            {!isDriver && <ReadyForDeliveryButton />}
            <CompleteOrderButton />
        </Toolbar>
    );
};

const OrderForm = ({ toolbar, disabled, ...props }: { toolbar?: React.ReactElement; disabled?: boolean }) => {
    const translate = useTranslate();
    return (
        <TabbedForm {...props} toolbar={toolbar}>
            <TabbedForm.Tab
                label={translate(`resources.misc.data`, { smart_count: 1 })}
            >
                <AsyncSelectInput
                    label={translate(`resources.misc.partner`, { smart_count: 1 })}
                    resource="businesses"
                    source={o(x => x.businessId)}
                    disabled={disabled}
                />
                <SelectInput
                    source={o(x => x.type)}
                    label={translate(`resources.misc.type`, { smart_count: 1, })}
                    disabled={disabled}
                    choices={[
                        { id: "Purchase", name: translate(`resources.misc.purchase`, { smart_count: 1 }) },
                        { id: "Sell", name: translate(`resources.misc.sell`, { smart_count: 1 }) }
                    ]}
                />
                <FormDataConsumer>
                    {({ formData }: { formData: Order }) => {
                        if (!disabled && (!formData?.businessId || !formData?.type)) {
                            return <></>;
                        }
                        return (
                            <ArrayInput
                                source={o(x => x.details)}
                                label={translate(`resources.misc.detail`, { smart_count: 2 })}
                                disabled={disabled}
                            >
                                <SimpleFormIterator inline disableAdd={disabled} disableRemove={disabled} disableReorder={disabled}>
                                    <AsyncSelectInput
                                        label={translate(`resources.misc.product`, { smart_count: 1 })}
                                        resource="products"
                                        source={od(x => x.productId)}
                                        disabled={disabled}
                                        filterToQuery={() => ({
                                            orderType: formData.type,
                                            businessId: formData.businessId
                                        })}
                                    />
                                    <FormDataConsumer>
                                        {({ scopedFormData }) => {
                                            if (!disabled && !scopedFormData?.productId) {
                                                return <></>;
                                            }
                                            return (
                                                <NumberInput
                                                    source={od(x => x.quantity)}
                                                    label={translate(`resources.misc.quantity`, { smart_count: 1 })}
                                                    disabled={disabled}
                                                />
                                            );
                                        }}
                                    </FormDataConsumer>
                                    <FormDataConsumer>
                                        {({ scopedFormData }) => {
                                            if (!disabled && !scopedFormData?.productId) {
                                                return <></>;
                                            }
                                            return (
                                                <NumberInput
                                                    source={od(x => x.price)}
                                                    label={translate(`resources.misc.price`, { smart_count: 1 })}
                                                    disabled={disabled}
                                                    defaultValue={scopedFormData.product?.prices?.[0]?.price ?? scopedFormData.product?.defaultPrice}
                                                />
                                            );
                                        }}
                                    </FormDataConsumer>
                                </SimpleFormIterator>
                            </ArrayInput>
                        );
                    }}
                </FormDataConsumer>
                <TextInput source={o(x => x.notes)} label={translate(`resources.misc.notes`, { smart_count: 2, })} disabled={disabled} />
            </TabbedForm.Tab>
        </TabbedForm>
    );
};

export const OrderCreate = () => (
    <Create>
        <OrderForm />
    </Create>
);

const OrderEditForm = () => {
    const { permissions } = usePermissions<Role>();
    const isDriver = permissions === Role.Driver;
    return <OrderForm toolbar={<OrderEditToolbar />} disabled={isDriver} />;
};

export const OrderEdit = () => (
    <Edit>
        <OrderEditForm />
    </Edit>
);