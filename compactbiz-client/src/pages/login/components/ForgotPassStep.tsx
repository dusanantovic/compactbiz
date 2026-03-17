import { TemporaryPinHasAlreadySent } from "../../../../models";
import * as React from "react";
import { useNotify } from "react-admin";
import { LoginSmallTitle, LoginTextField, LoginTitle, LoginTextFieldWithTop, SubmitButton } from "../styledComponents";
import { LoginStepType } from "../Login";
import { changePassword, sendTempPin } from "../../../authClient";
import { errorMessageParser } from "../../../http";

interface ForgotPassProps {
    email: string;
    handleStep: (step: LoginStepType) => void;
    changeEmail: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ForgotPassStep = ({ email, handleStep, changeEmail }: ForgotPassProps) => {
    const [tempPinIsSent, setTempPinIsSent] = React.useState(false);
    const [tempPin, setTempPin] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [repeatPassword, setRepeatPassword] = React.useState("");
    const [loading, setLoader] = React.useState(false);
    const notify = useNotify();

    const handleSubmit = async () => {
        if (!tempPin) {
            notify("Please enter your temporary pin", { type: "warning" });
            return;
        }
        if (!email) {
            notify("Please enter you email", { type: "warning" });
            return;
        }
        if (!newPassword) {
            notify("Please enter you password", { type: "warning" });
            return;
        }
        if (!repeatPassword) {
            notify("Please enter you password", { type: "warning" });
            return;
        }
        if (newPassword !== repeatPassword) {
            notify("Passwords do not match", { type: "warning" });
            return;
        }
        setLoader(true);
        try {
            await changePassword(email, tempPin, newPassword);
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
            setTempPinIsSent(true);
        } catch (err: any) {
            notify(errorMessageParser(err.message), { type: "error" });
            if (err.body?.name === new TemporaryPinHasAlreadySent().name) {
                setTempPinIsSent(true);
            }
        }
        setLoader(false);
    };

    const changeTempPin = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setTempPin(value && value.trim() || "");
    };

    const changeNewPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setNewPassword(value && value.trim() || "");
    };

    const changeRepeatPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setRepeatPassword(value && value.trim() || "");
    };

    const handleKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter") {
            if (tempPinIsSent) {
                void handleSubmit();
            } else {
                void handleSendTempPin();
            }
        }
    };

    return (
        <>
            <LoginTitle variant="h5">
                Forgot password?
            </LoginTitle>
            <LoginSmallTitle>
                {tempPinIsSent ? (
                    `We sent you temporary pin to your email "${email}"`
                ) : (
                    "Please enter your email"
                )}
            </LoginSmallTitle>
            {!tempPinIsSent && (
                <LoginTextField
                    type="email"
                    placeholder="Please enter your email"
                    value={email}
                    onChange={changeEmail}
                    onKeyUp={(e) => handleKeyUp(e)}
                />
            )}
            {tempPinIsSent && (
                <LoginTextField
                    type="number"
                    placeholder="Please enter your temporary pin"
                    value={tempPin}
                    onChange={changeTempPin}
                    onKeyUp={(e) => handleKeyUp(e)}
                />
            )}
            {tempPinIsSent && (
                <LoginTextFieldWithTop
                    type="password"
                    placeholder="Please enter your new password"
                    value={newPassword}
                    onChange={changeNewPassword}
                    onKeyUp={(e) => handleKeyUp(e)}
                />
            )}
            {tempPinIsSent && (
                <LoginTextFieldWithTop
                    type="password"
                    placeholder="Please repeat your new password"
                    value={repeatPassword}
                    onChange={changeRepeatPassword}
                    onKeyUp={(e) => handleKeyUp(e)}
                />
            )}
            <SubmitButton
                onClick={tempPinIsSent ? handleSubmit : handleSendTempPin}
                disabled={loading}
            >
                {loading ? "Loading..." : tempPinIsSent ? "Change password" : "Get temporary pin"}
            </SubmitButton>
        </>
    );
};