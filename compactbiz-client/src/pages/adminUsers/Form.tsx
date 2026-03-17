import * as React from "react";
import { Create, SelectInput, TabbedForm, TextInput, useTranslate } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import { User } from "models";
import { Role } from "models/enums";
import { typed, getEnumEntries } from "../../util";
import { AsyncSelectInput } from "../../components";

const f = typed(User);

const FacilitySelectInput = () => {
    const translate = useTranslate();
    const companyId = useWatch({ name: "companyId" });
    const { setValue } = useFormContext();
    const prevCompanyId = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (prevCompanyId.current !== null && prevCompanyId.current !== companyId) {
            setValue("facilityId", null);
        }
        prevCompanyId.current = companyId;
    }, [companyId, setValue]);

    return (
        <AsyncSelectInput
            source="facilityId"
            resource="admin/facilities"
            label={translate("resources.misc.facility", { smart_count: 1 })}
            disabled={!companyId}
            filterToQuery={() => ({ companyId })}
        />
    );
};

const excludedRoles = new Set<Role>([Role.Guest, Role.Admin]);

const AdminUserForm = ({ ...props }) => {
    const translate = useTranslate();

    const roleChoices = getEnumEntries(Role)
        .filter(({ id }) => !excludedRoles.has(id as Role))
        .map(({ id, name }) => ({
            id,
            name: translate(`resources.misc.${(name as string).replace(/^(.)/, c => c.toLowerCase()).replace(" ", "")}`),
        }));

    return (
        <TabbedForm {...props}>
            <TabbedForm.Tab label={translate("resources.misc.data", { smart_count: 1 })}>
                <AsyncSelectInput
                    source="companyId"
                    resource="companies"
                    label={translate("resources.misc.company", { smart_count: 1 })}
                />
                <FacilitySelectInput />
                <TextInput source={f(x => x.firstName)} label={translate("resources.misc.firstName", { smart_count: 1 })} />
                <TextInput source={f(x => x.lastName)} label={translate("resources.misc.lastName", { smart_count: 1 })} />
                <TextInput source={f(x => x.phone)} label={translate("resources.misc.phone", { smart_count: 1 })} />
                <TextInput source={f(x => x.email)} />
                <SelectInput
                    source={f(x => x.role)}
                    label={translate("resources.misc.role", { smart_count: 1 })}
                    choices={roleChoices}
                />
                <TextInput source={f(x => x.password)} label={translate("resources.misc.password", { smart_count: 1 })} />
            </TabbedForm.Tab>
        </TabbedForm>
    );
};

export const AdminUserCreate = () => (
    <Create>
        <AdminUserForm />
    </Create>
);
