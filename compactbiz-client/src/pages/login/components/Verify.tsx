import * as React from "react";
import { useNotify } from "react-admin";
import { BottomTextWrapper, BottomTextLeft, BottomTextRight, LoginTextFieldWithTop, LoginTitle, SubmitButton, LoginSmallTitle } from "../styledComponents";
import { LoginStepType } from "../Login";
import { errorMessageParser } from "../../../http";
import { sendTempPin, verifyStaff } from "../../../authClient";

interface VerifyStepProps {
    email: string;
    handleStep: (step: LoginStepType) => void;
    changeEmail: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const VerifyStep = ({ email, handleStep, changeEmail }: VerifyStepProps) => {
    const [tempPin, setTempPin] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [repeatPassword, setRepeatPassword] = React.useState("");
    const [loading, setLoader] = React.useState(false);
    const notify = useNotify();

    const handleSubmit = async () => {
        if (!email || !email.trim()) {
            notify("Please enter your email", { type: "warning" });
            return;
        }
        if (!tempPin || !tempPin.trim()) {
            notify("Please enter your temporary pin", { type: "warning" });
            return;
        }
        if (!password) {
            notify("Please enter your password", { type: "warning" });
            return;
        }
        if (password !== repeatPassword) {
            notify("Passwords do not match", { type: "warning" });
            return;
        }
        setLoader(true);
        try {
            await verifyStaff(email, tempPin, password);
            handleStep(LoginStepType.Login);
        } catch (err: any) {
            notify(errorMessageParser(err.message), { type: "error" });
        }
        setLoader(false);
    };

    const handleSendTempPin = async () => {
        if (!email) {
            notify("Please enter your email first", { type: "warning" });
            return;
        }
        setLoader(true);
        try {
            await sendTempPin(email);
            notify("Temporary pin sent", { type: "info" });
        } catch (err: any) {
            notify(errorMessageParser(err.message), { type: "error" });
        }
        setLoader(false);
    };

    const changeTempPin = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setTempPin(value && value.trim() || "");
    };

    const changePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value.trim() || "");
    };

    const changeRepeatPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRepeatPassword(event.target.value.trim() || "");
    };

    const handleKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter") {
            void handleSubmit();
        }
    };

    return (
        <>
            <LoginTitle variant="h5">
                Verify your account
            </LoginTitle>
            <LoginSmallTitle variant="h6">
                We sent temporary pin to your email ({email})
            </LoginSmallTitle>
            <LoginTextFieldWithTop
                type="email"
                placeholder="Please enter your email"
                value={email}
                onChange={changeEmail}
                onKeyUp={(e) => handleKeyUp(e)}
            />
            <LoginTextFieldWithTop
                type="text"
                placeholder="Please enter your temporary pin"
                value={tempPin}
                onChange={changeTempPin}
                onKeyUp={(e) => handleKeyUp(e)}
            />
            <LoginTextFieldWithTop
                type="password"
                placeholder="Please enter your new password"
                value={password}
                onChange={changePassword}
                onKeyUp={(e) => handleKeyUp(e)}
            />
            <LoginTextFieldWithTop
                type="password"
                placeholder="Please repeat your new password"
                value={repeatPassword}
                onChange={changeRepeatPassword}
                onKeyUp={(e) => handleKeyUp(e)}
            />
            <SubmitButton
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? "Loading..." : "Verify"}
            </SubmitButton>
            <BottomTextWrapper>
                <BottomTextLeft variant="body2" onClick={() => handleSendTempPin()}>
                    Resend temporary pin
                </BottomTextLeft>
                <BottomTextRight></BottomTextRight>
            </BottomTextWrapper>
        </>
    );
};