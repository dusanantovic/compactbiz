import { styled } from "@mui/material";
import { List } from "react-admin";

export const BizList = styled(List)(({ theme }) => ({
    "& > :first-child": {
        "& >div:nth-of-type(1) >div:nth-of-type(1)": {
            "& >div:nth-of-type(1) >div:nth-of-type(1)": {
                position: "relative",
                transform: "unset",
                "-webkit-transform": "unset"
            }
        },
        marginTop: theme.spacing(3)
    }
}));