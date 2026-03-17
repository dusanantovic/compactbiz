import { TextField, styled } from "@mui/material";

export const LoginTextField = styled(TextField)({
    width: "100%"
});

export const LoginTextFieldWithTop = styled(LoginTextField)(({ theme }) => ({
    marginTop: theme.spacing(4)
}));