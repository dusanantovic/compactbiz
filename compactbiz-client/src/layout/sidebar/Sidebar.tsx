import * as React from "react";
import { SidebarProps, useSidebarState } from "react-admin";
import { SidebarContainer } from "./styledComponents";
import { Collapse } from "@mui/material";

export const BizSidebar = ({ ...props }: SidebarProps) => {
    const [open] = useSidebarState();

    return (
        <Collapse in={open} orientation="horizontal">
            <SidebarContainer>
                {props.children}
            </SidebarContainer>
        </Collapse>
    );
};