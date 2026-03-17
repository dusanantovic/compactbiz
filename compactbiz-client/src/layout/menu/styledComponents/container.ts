import { styled } from "@mui/material";

export const MenuContainer = styled("div")(({ theme }) => ({
    width: "100%",
    height: "calc(100vh - 60px)",
    backgroundColor: theme.palette.primary.main,
    position: "relative",
    paddingTop: theme.spacing(1),
    paddingBottom: "68px"
}));
