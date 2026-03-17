import * as React from "react";
import { Menu, MenuItem, Theme, useMediaQuery } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { AppBarIconButton, AppBarTextButton, AppBarTextContentWrapper } from "../styledComponents";

import { context } from "../../../cache";
import { LinkWithoutStyle } from "../../../styledComponents";
import { LocalesMenuButton, useLogout } from "react-admin";

export const UserMenu = () => {
    const [openMenu, setOpenMenu] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null as Element | null);
    const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
    const logout = useLogout();
    const handleOpenMenu = (value: boolean, event?: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        setOpenMenu(value);
        if (event) {
            setAnchorEl(event.currentTarget || null);
        } else {
            setAnchorEl(null);
        }
    };

    const handleLogout = () => {
        void logout({}, "/login", false);
    };

    return (
        <AppBarTextContentWrapper>
            {isSmall ? (
                <AppBarIconButton
                    onClick={(e) => handleOpenMenu(!openMenu, e)}
                >
                    <PersonIcon />
                </AppBarIconButton>
            ) : (
                <AppBarTextButton
                    onClick={(e) => handleOpenMenu(!openMenu, e)}
                >
                    {context.name}
                </AppBarTextButton>
            )}
            <Menu
                open={openMenu}
                anchorEl={anchorEl}
                onClose={() => handleOpenMenu(false)}
            >
                {isSmall && (
                    <MenuItem>
                        <LocalesMenuButton />
                    </MenuItem>
                )}
                <MenuItem>
                    <LinkWithoutStyle to="/profile">
                        Profile
                    </LinkWithoutStyle>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                    Logout
                </MenuItem>
            </Menu>
        </AppBarTextContentWrapper>
    );
};
