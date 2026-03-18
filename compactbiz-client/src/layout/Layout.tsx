import * as React from "react";
import { CoreLayoutProps, Layout, LayoutClasses } from "react-admin";
import { styled } from "@mui/material";
import { usePageTracking } from "./pageTracking";
import { BizAppBar } from "./appBar";
import { BizSidebar } from "./sidebar";
import { BizMenu } from "./menu";

const BizLayoutComponent = ({ ...props }: CoreLayoutProps) => {
    usePageTracking();
    return (
        <Layout
            {...props}
            menu={BizMenu}
            appBar={BizAppBar}
            sidebar={BizSidebar}
        />
    );
};

export const BizLayout = styled(BizLayoutComponent)(({ theme }) => ({
    [`& .${LayoutClasses.appFrame}`]: {
        marginTop: "0px"
    },
    [`& .${LayoutClasses.contentWithSidebar}`]: {
        backgroundColor: theme.palette.background.default
    },
    [`& .${LayoutClasses.content}`]: {
        backgroundColor: theme.palette.background.default,
        // padding: theme.spacing(2),
        // [theme.breakpoints.down("sm")]: {
        //     padding: theme.spacing(1)
        // }
    },
    [`& .RaList-content`]: {
        borderRadius: 12,
        [theme.breakpoints.down("sm")]: {
            width: `calc(100vw - ${theme.spacing(2)})`,
            overflowX: "auto !important"
        }
    },
    [`& .RaList-main`]: {
        overflowX: "scroll",
        maxWidth: `calc(100vw - 30px)`
       
    },
    [`& .RaList-main.asideOpen`]: {
        maxWidth: `calc(100vw - 310px)`
    },
    [`& .RaLayout-appFrame.sidebarOpened .RaList-main.asideOpen`]: {
        maxWidth: `calc(100vw - 550px)`
    },
    [`& .RaLayout-appFrame.sidebarOpened .RaList-main`]: {
        maxWidth: `calc(100vw - 270px)`,
        [theme.breakpoints.down("sm")]: {
            maxWidth: `100vw`,
            overflowX: "auto !important"
        }
    }
}));
