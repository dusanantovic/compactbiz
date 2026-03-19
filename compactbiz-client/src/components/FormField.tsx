import * as React from "react";
import { Box, Typography } from "@mui/material";

interface FormFieldProps {
    children: React.ReactElement;
}

export const FormField = ({ children }: FormFieldProps) => {
    const label = children.props.label;
    const child = React.cloneElement(children, {
        label: false,
        InputProps: {
            label: ""
        },
        TextFieldProps: {
            InputProps: {
                label: ""
            }
        }
    });

    return (
        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
            {label != null && label !== false && label !== "" && (
                <Typography
                    variant="body2"
                    sx={{ mb: 0.75, fontWeight: 600, color: "text.primary", lineHeight: 1.2 }}
                >
                    {label}
                </Typography>
            )}
            {child}
        </Box>
    );
};
