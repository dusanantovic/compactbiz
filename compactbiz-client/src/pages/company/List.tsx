import * as React from "react";
import { Datagrid, Empty, FunctionField, TextField, useTranslate } from "react-admin";
import { CompanyAside } from "./Aside";
import { BizList } from "../../styledComponents";
import { typed } from "../../util";
import { Company } from "../../../models";
import { Chip } from "@mui/material";

const c = typed(Company);

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
    Active: "success",
    Demo: "info",
    Paused: "warning",
    Inactive: "error",
};

export const CompanyList = () => {
    const translate = useTranslate();
    return (
        <BizList
            title="Companies"
            aside={<CompanyAside />}
            actions={false}
            empty={<Empty hasCreate={false} />}
        >
            <Datagrid>
                <TextField source={c(x => x.id)} label="#ID" />
                <TextField source={c(x => x.name)} label={translate(`resources.misc.name`, { smart_count: 1, })} />
                <FunctionField
                    source={c(x => x.status)}
                    label="Status"
                    render={(record: Company) => (
                        <Chip
                            label={record.status}
                            color={STATUS_COLOR[record.status] ?? "default"}
                            size="small"
                        />
                    )}
                />
            </Datagrid>
        </BizList>
    );
};