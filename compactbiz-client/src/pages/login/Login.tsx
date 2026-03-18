import * as React from "react";
import { LoginBox, LoginContainer, LoginContentWrapper } from "./styledComponents";
import { CheckStep, LoginStep, ForgotPassStep, VerifyStep, SignupStep } from "./components";
import { Theme, useMediaQuery } from "@mui/material";

export enum LoginStepType {
    Check = "Check",
    Login = "Login",
    Forgot = "Forgot",
    Verify = "Verify",
    Signup = "Signup"
}

export const LoginPage = () => {
    const [email, setEmail] = React.useState("");
    const [step, setStep] = React.useState(LoginStepType.Check);
    const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

    const handleStep = (step: LoginStepType) => {
        setStep(step);
    };

    const changeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setEmail(value && value.trim() || "");
    };

    return (
        <LoginContainer>
            {isSmall && (
                <LoginContentWrapper>
                    {/* Left side */}
                </LoginContentWrapper>
            )}
            <LoginContentWrapper>
                <LoginBox>
                    {step === LoginStepType.Check ? (
                        <CheckStep
                            handleStep={handleStep}
                            email={email}
                            changeEmail={changeEmail}
                        />
                    ) : step === LoginStepType.Login ? (
                        <LoginStep
                            handleStep={handleStep}
                            email={email}
                        />
                    ) : step === LoginStepType.Forgot ? (
                        <ForgotPassStep
                            handleStep={handleStep}
                            email={email}
                            changeEmail={changeEmail}
                        />
                    ) : step === LoginStepType.Verify ? (
                        <VerifyStep
                            handleStep={handleStep}
                            email={email}
                            changeEmail={changeEmail}
                        />
                    ) : (
                        <SignupStep
                            handleStep={handleStep}
                            email={email}
                            changeEmail={changeEmail}
                        />
                    )}
                </LoginBox>
            </LoginContentWrapper>
        </LoginContainer>
    );
};