import { Typography, styled } from "@mui/material";

export const BottomTextWrapper = styled("div")(({ theme }) => ({
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing()
}));

export const BottomTextLeft = styled(Typography)(({ theme }) => ({
    cursor: "pointer",
    color: theme.palette.primary.main
}));

export const BottomTextRight = styled(Typography)(({ theme }) => ({
    cursor: "pointer",
    color: theme.palette.secondary.main,
    fontWeight: "bold"
}));