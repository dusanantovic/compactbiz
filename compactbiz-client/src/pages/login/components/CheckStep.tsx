import * as React from "react";
import { useNotify } from "react-admin";
import { LoginTextField, LoginSmallTitle, LoginTitle, SubmitButton, BottomTextWrapper, BottomTextLeft } from "../styledComponents";
import { LoginStepType } from "../Login";
import { errorMessageParser } from "../../../http";
import { checkUser, sendTempPin } from "../../../authClient";
import { TemporaryPinHasAlreadySent } from "../../../../models";

interface CheckStepProps {
    email: string;
    handleStep: (step: LoginStepType) => void;
    changeEmail: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CheckStep = ({ email, handleStep, changeEmail }: CheckStepProps) => {
    const [loading, setLoader] = React.useState(false);
    const notify = useNotify();

    const handleSubmit = async () => {
        if (!email || !email.trim()) {
            notify("Please enter your email", { type: "warning" });
            return;
        }
        setLoader(true);
        try {
            const { verified } = await checkUser(email);
            if (verified) {
                handleStep(LoginStepType.Login);
            } else {
                let goToVerify = true;
                try {
                    await sendTempPin(email);
                } catch (err2: any) {
                    if (err2.body?.name !== new TemporaryPinHasAlreadySent().name) {
                        notify(errorMessageParser(err2.message), { type: "error" });
                        goToVerify = false;
                    }
                }
                if (goToVerify) {
                    handleStep(LoginStepType.Verify);
                }
            }
        } catch (err: any) {
            notify(errorMessageParser(err.message), { type: "error" });
        }
        setLoader(false);
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
                Please enter your email
            </LoginSmallTitle>
            <LoginTextField
                type="email"
                placeholder="Please enter your email"
                value={email}
                onChange={changeEmail}
                onKeyUp={(e) => handleKeyUp(e)}
            />
            <SubmitButton onClick={handleSubmit} disabled={loading}>
                {loading ? "Loading..." : "Continue"}
            </SubmitButton>
        </>
    );
};
