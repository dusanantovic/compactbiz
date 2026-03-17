import * as React from "react";
import { LayoutClasses, LocalesMenuButton, useRefresh, useSidebarState } from "react-admin";
import CBLogo from "src/assets/CBLogo.png";
import NavigationRefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import { AppBarContainer, AppBarLeft, AppBarCenter, AppBarRight, AppBarTextContent, AppBarIconButton } from "./styledComponents";
import { UserMenu } from "./components";
import { Menu as MenuIcon } from "@mui/icons-material";
import { Theme, useMediaQuery } from "@mui/material";
import { useOpenAside } from "src/hooks/useOpenAside";

export const appBarHeight = 60;

export const BizAppBar = () => {
    const refresh = useRefresh();
    const [openSidebar, setOpenSidebar] = useSidebarState();
    const { toggleOpen } = useOpenAside();
    const largerThenSmall = useMediaQuery("(min-width:615px)", { noSsr: true });
    const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

    React.useEffect(() => {
        const rootLayoutElement = document.querySelector(`.${LayoutClasses.appFrame}`);
        if (rootLayoutElement) {
            if (openSidebar) {
                rootLayoutElement.classList.add("sidebarOpened");
            } else {
                rootLayoutElement.classList.remove("sidebarOpened");
            }
        }
    }, [openSidebar]);

    return (
        <AppBarContainer>
            <AppBarLeft>
                <AppBarIconButton onClick={() => setOpenSidebar(!openSidebar)}>
                    <MenuIcon />
                </AppBarIconButton>
                <AppBarTextContent
                    id="react-admin-title"
                    variant="subtitle1"
                    noWrap
                    sx={{ fontSize: "14px", fontWeight: 500, maxWidth: 220 }}
                />
            </AppBarLeft>

            <AppBarCenter>
                {largerThenSmall && (
                    <img
                        src={CBLogo}
                        alt="CompactBiz"
                        style={{ height: "60px", objectFit: "contain", filter: "brightness(0) invert(1)" }}
                    />
                )}
            </AppBarCenter>

            <AppBarRight>
                {isSmall && (
                    <AppBarIconButton onClick={() => toggleOpen()}>
                        <SearchIcon />
                    </AppBarIconButton>
                )}
                {largerThenSmall && <LocalesMenuButton />}
                <AppBarIconButton onClick={() => refresh()}>
                    <NavigationRefreshIcon />
                </AppBarIconButton>
                <UserMenu />
            </AppBarRight>
        </AppBarContainer>
    );
};
