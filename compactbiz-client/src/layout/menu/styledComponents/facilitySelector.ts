import { FormControl, OutlinedInput, Select, selectClasses, styled } from "@mui/material";

export const FacilitySelectorFormControl = styled(FormControl)({
    position: "absolute",
    bottom: 0,
    width: "100%"
});

export const FacilitySelectorSelect = styled(Select)(({ theme }) => ({
    [`& .${selectClasses.select}`]: {
        paddingRight: `${theme.spacing(5.75)} !important`
    }
}));

export const FacilitySelectorOutlinedInput = styled(OutlinedInput)(({ theme }) => ({
    color: "rgba(255,255,255,0.8)",
    fontWeight: 500,
    fontSize: "13px",
    borderRadius: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    "& svg": {
        color: "rgba(255,255,255,0.35)",
        right: theme.spacing(1.5)
    },
    "&:hover": {
        backgroundColor: "rgba(0,0,0,0.28)"
    },
    "& fieldset": {
        border: "none",
        borderTop: "1px solid rgba(255,255,255,0.09)"
    }
}));
