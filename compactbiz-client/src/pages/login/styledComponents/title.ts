import { Typography, styled } from "@mui/material";

export const LoginTitle = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.primary,
    textAlign: "left",
    width: "100%",
    marginBottom: theme.spacing(),
    fontWeight: "bold"
}));

export const LoginSmallTitle = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.primary,
    textAlign: "left",
    width: "100%",
    marginBottom: theme.spacing(4)
}));