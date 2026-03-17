import { Typography } from "@mui/material";
import * as React from "react";
import { LoginStepType } from "../Login";

interface SignupStepProps {
    email: string;
    handleStep: (step: LoginStepType) => void;
    changeEmail: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SignupStep = ({ email, handleStep, changeEmail }: SignupStepProps) => {
    return (
        <Typography>

        </Typography>
    );
};