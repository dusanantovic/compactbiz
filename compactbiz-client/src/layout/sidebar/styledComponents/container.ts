import { styled } from "@mui/material";
import { appBarHeight } from "../../appBar/AppBar";

export const SidebarContainer = styled("div")(({ theme }) => ({
    position: "sticky",
    top: `${appBarHeight}px`,
    width: "240px",
    height: `calc(100vh - ${appBarHeight}px)`,
    backgroundColor: "#011528",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    overflowY: "auto",
    overflowX: "hidden",
    scrollbarWidth: "none",
    "&::-webkit-scrollbar": {
        display: "none"
    },
    [theme.breakpoints.down("sm")]: {
        width: "100vw",
        zIndex: 3
    }
}));
