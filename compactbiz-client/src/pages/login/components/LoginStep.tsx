import { Unverified } from "../../../../models";
import * as React from "react";
import { useLogin, useNotify } from "react-admin";
import { LoginTextField, LoginSmallTitle, LoginTitle, LoginTextFieldWithTop, SubmitButton, BottomTextWrapper, BottomTextLeft } from "../styledComponents";
import { errorMessageParser } from "../../../http";
import { sendTempPin } from "../../../authClient";
import { LoginStepType } from "../Login";

interface LoginStepProps {
    email: string;
    handleStep: (step: LoginStepType) => void;
    changeEmail: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LoginStep = ({ email, handleStep, changeEmail }: LoginStepProps) => {
    const [password, setPassword] = React.useState("");
    const [loading, setLoader] = React.useState(false);
    const login = useLogin();
    const notify = useNotify();

    const handleSubmit = async () => {
        if (!email) {
            notify("Please enter you email", { type: "warning" });
            return;
        }
        if (!password) {
            notify("Please enter you password", { type: "warning" });
            return;
        }
        setLoader(true);
        try {
            await login({ email, password });
        } catch (err: any) {
            notify(errorMessageParser(err.message), { type: "error" });
            if (err.message === "Unverified user") {
                await sendTempPin(email);
                handleStep(LoginStepType.Verify);
            }
        }
        setLoader(false);
    };

    const changePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setPassword(value && value.trim() || "");
    };

    const handleKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter") {
            void handleSubmit();
        }
    };

    return (
        <>
            <LoginTitle variant="h5">
                Welcome back!
            </LoginTitle>
            <LoginSmallTitle variant="h6">
                Please login
            </LoginSmallTitle>
            <LoginTextField
                type="email"
                placeholder="Please enter your email"
                value={email}
                onChange={changeEmail}
                onKeyUp={(e) => handleKeyUp(e)}
            />
            <LoginTextFieldWithTop
                type="password"
                placeholder="Please enter your password"
                value={password}
                onChange={changePassword}
                onKeyUp={(e) => handleKeyUp(e)}
            />
            <SubmitButton
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? "Loading..." : "Login"}
            </SubmitButton>
            <BottomTextWrapper>
                <BottomTextLeft variant="body2" onClick={() => handleStep(LoginStepType.Forgot)}>
                    Forgot password
                </BottomTextLeft>
                {/* <BottomTextRight variant="body1" onClick={() => handleStep(LoginStepType.Signup)}>
                    Signup
                </BottomTextRight> */}
            </BottomTextWrapper>
        </>
    );
};