import * as React from "react";
import { Theme, useMediaQuery } from "@mui/material";
import { useStore } from "react-admin";

export const useOpenAside = () => {
    const localStorageOpenAside = localStorage.getItem("openAside");
    const [open, setOpen] = useStore("openAside", !localStorageOpenAside || localStorageOpenAside === "true");
    const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
    const isMedium = useMediaQuery((theme: Theme) => theme.breakpoints.between("sm", "md"));
    const isLarge = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

    React.useEffect(() => {
        if (isSmall || isMedium) {
            setOpen(false);
        } else if (isLarge) {
            setOpen(true);
        } else {
            setOpen(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSmall, isMedium, isLarge]);

    const toggleOpen = () => {
        localStorage.setItem("openAside", String(!open));
        setOpen(!open);
    };

    return {
        open,
        toggleOpen
    };
};