import { Button, styled } from "@mui/material";

export const SubmitButton = styled(Button)(({ theme }) => ({
    width: "100%",
    height: "48px",
    marginTop: theme.spacing(4),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.secondary,
    textTransform: "none",
    fontWeight: "bold",
    "&:hover": {
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.text.secondary
    },
    "&:focus": {
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.text.secondary
    }
}));