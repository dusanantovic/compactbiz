import * as React from "react";
import { useLogin, useNotify } from "react-admin";
import { LoginSmallTitle, LoginTitle, SubmitButton, BottomTextWrapper, BottomTextLeft, BottomTextRight, LoginTextField } from "../styledComponents";
import { errorMessageParser } from "../../../http";
import { LoginStepType } from "../Login";

interface LoginStepProps {
    email: string;
    handleStep: (step: LoginStepType) => void;
}

export const LoginStep = ({ email, handleStep }: LoginStepProps) => {
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
                {email}
            </LoginSmallTitle>
            <LoginTextField
                type="password"
                placeholder="Please enter your password"
                value={password}
                onChange={changePassword}
                onKeyUp={(e) => handleKeyUp(e)}
            />
            <SubmitButton onClick={handleSubmit} disabled={loading}>
                {loading ? "Loading..." : "Login"}
            </SubmitButton>
            <BottomTextWrapper>
                <BottomTextLeft variant="body2" onClick={() => handleStep(LoginStepType.Forgot)}>
                    Forgot password
                </BottomTextLeft>
                <BottomTextRight variant="body2" onClick={() => handleStep(LoginStepType.Check)}>
                    Back
                </BottomTextRight>
            </BottomTextWrapper>
        </>
    );
};