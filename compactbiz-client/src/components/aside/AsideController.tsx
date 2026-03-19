import * as React from "react";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Divider, Typography, useMediaQuery } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { FilterLiveSearch, useTranslate } from "react-admin";
import { useNavigate } from "react-router-dom";
import {
    AsideControllerWrapper,
    AsideControllerToggle,
    AsideControllerPanel,
    AsideControllerInner,
    AsideControllerAddButton
} from "../../styledComponents";
import { useOpenAside } from "src/hooks/useOpenAside";

interface AsideControllerProps {
    source: string;
    searchPlaceholder?: string;
    addButtonText?: string;
    children?: string | JSX.Element | JSX.Element[];
}

const AsideControllerComponent = ({ source, searchPlaceholder, addButtonText, children }: AsideControllerProps) => {
    const { open, toggleOpen } = useOpenAside();

    React.useEffect(() => {
        const main = document.querySelector(".RaList-main");
        if (main) {
            main.classList.toggle("asideOpen", open);
        }
    }, [open]);
    const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
    const nav = useNavigate();
    const translate = useTranslate();

    return (
        <AsideControllerWrapper>
            {!isSmall && (
                <AsideControllerToggle onClick={toggleOpen}>
                    {open ? <ChevronRight /> : <ChevronLeft />}
                </AsideControllerToggle>
            )}
            <AsideControllerPanel open={open}>
                <AsideControllerInner>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", color: "text.primary" }}>
                        {translate("resources.misc.filters", { smart_count: 1 })}
                    </Typography>
                    <FilterLiveSearch
                        source="q"
                        label={false}
                        placeholder={searchPlaceholder}
                        fullWidth
                    />
                    {addButtonText && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <AsideControllerAddButton onClick={() => nav(`/${source}/create`)}>
                                {addButtonText}
                            </AsideControllerAddButton>
                        </>
                    )}
                    {children && (
                        <div style={{ marginTop: "16px" }}>
                            {children}
                        </div>
                    )}
                </AsideControllerInner>
            </AsideControllerPanel>
        </AsideControllerWrapper>
    );
};

export const AsideController = AsideControllerComponent;
