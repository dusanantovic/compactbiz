import { styled } from "@mui/material";

export const LoginContainer = styled("div")({
    width: "100%",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    background: "linear-gradient(18deg, rgba(162,227,204,1) 0%, rgba(0,31,64,0.7875744047619048) 53%, rgba(2,18,36,1) 100%)"
});

export const LoginContentWrapper = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
    [theme.breakpoints.down("md")]: {
        width: "100%"
    },
    height: "100%"
}));

export const LoginBox = styled("div")(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "70%",
    [theme.breakpoints.only("xs")]: {
        width: "80%"
    },
    minHeight: "300px",
    maxHeight: "90vh",
    padding: theme.spacing(6),
    borderRadius: `${theme.shape.borderRadius * 3}px`,
    backgroundColor: "#ffffff"
}));
