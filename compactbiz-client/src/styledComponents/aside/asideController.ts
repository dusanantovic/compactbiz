import { IconButton, styled } from "@mui/material";

const APP_BAR_HEIGHT = 60;

export const AsideControllerWrapper = styled("div")({
    position: "relative",
    height: `calc(100vh - ${APP_BAR_HEIGHT}px)`,
    display: "flex",
    flexShrink: 0,
    marginLeft: "16px"
});

export const AsideControllerToggle = styled(IconButton)(({ theme }) => ({
    position: "absolute",
    top: "20px",
    left: "-13px",
    zIndex: 4,
    width: "13px",
    height: "32px",
    padding: 0,
    borderRadius: "6px 0 0 6px",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRight: "none",
    boxShadow: "-2px 0 8px rgba(0,0,0,0.07)",
    "&:hover": {
        backgroundColor: "#f5f7fa"
    },
    "& svg": {
        fontSize: "13px",
        color: theme.palette.text.primary
    }
}));

export const AsideControllerPanel = styled("div")<{ open: boolean }>(({ open, theme }) => ({
    width: open ? "280px" : "0px",
    flexShrink: 0,
    overflow: "hidden",
    //transition: "width 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
    borderLeft: open ? "1px solid rgba(0,0,0,0.07)" : "none",
    backgroundColor: "#ffffff",
    height: "100%",
    [theme.breakpoints.down("sm")]: {
        position: "fixed",
        top: `${APP_BAR_HEIGHT}px`,
        right: 0,
        bottom: 0,
        width: open ? "100vw" : "0",
        zIndex: 1200,
        borderLeft: "none",
        boxShadow: open ? "-4px 0 24px rgba(0,0,0,0.12)" : "none"
    }
}));

export const AsideControllerInner = styled("div")(({ theme }) => ({
    width: "280px",
    height: "100%",
    padding: theme.spacing(3),
    overflowY: "auto",
    scrollbarWidth: "thin",
    "&::-webkit-scrollbar": { width: "4px" },
    "&::-webkit-scrollbar-thumb": { background: "rgba(0,0,0,0.1)", borderRadius: "2px" },
    [theme.breakpoints.down("sm")]: {
        width: "100vw"
    }
}));

// Legacy Grid-based exports kept for backward compatibility
export { AsideControllerWrapper as AsideControllerContainer, AsideControllerInner as AsideControllerItem };
