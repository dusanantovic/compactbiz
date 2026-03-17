import { Button, styled } from "@mui/material";

export const AsideControllerAddButton = styled(Button)(({ theme }) => ({
    width: "100%",
    textTransform: "none",
    fontWeight: 600,
    borderRadius: "8px",
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: "#ffffff",
    color: theme.palette.text.primary,
    "&:hover": {
        backgroundColor: theme.palette.background.default,
        borderColor: theme.palette.primary.main
    }
}));
