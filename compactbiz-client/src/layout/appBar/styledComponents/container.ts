import { styled } from "@mui/material";
import { appBarHeight } from "../AppBar";

export const AppBarContainer = styled("div")(({ theme }) => ({
    position: "sticky",
    top: 0,
    zIndex: 1100,
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    width: "100vw",
    height: `${appBarHeight}px`,
    padding: `0 ${theme.spacing(1.5)}`,
    backgroundColor: "#001F40",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    overflow: "visible"
}));

export const AppBarLeft = styled("div")({
    display: "flex",
    alignItems: "center",
    gap: "4px"
});

export const AppBarCenter = styled("div")({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible"
});

export const AppBarRight = styled("div")({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "2px",
    "& button": {
        color: "rgba(255,255,255,0.82)",
        textTransform: "none",
        borderRadius: "8px",
        "&:hover": {
            backgroundColor: "rgba(255,255,255,0.08)",
            color: "#ffffff"
        }
    }
});

// Legacy — still used by UserMenu
export const AppBarContentWrapper = styled("div")({
    display: "flex",
    alignItems: "center",
    height: "100%",
    gap: "2px"
});

export const AppBarTextContentWrapper = styled("div")({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
});
