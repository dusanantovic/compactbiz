import { Button, IconButton, styled } from "@mui/material";

export const AppBarTextButton = styled(Button)({
    color: "rgba(255,255,255,0.82)",
    textTransform: "none",
    fontSize: "14px",
    fontWeight: 500,
    borderRadius: "8px",
    padding: "6px 12px",
    "&:hover": {
        backgroundColor: "rgba(255,255,255,0.08)",
        color: "#ffffff"
    }
});

export const AppBarIconButton = styled(IconButton)({
    color: "rgba(255,255,255,0.65)",
    borderRadius: "8px",
    width: 38,
    height: 38,
    "&:hover": {
        backgroundColor: "rgba(255,255,255,0.08)",
        color: "#ffffff"
    },
    "& svg": {
        width: "20px",
        height: "20px"
    }
});
