import { Company } from "../models";

export const welcomeEmail = (company: Company): string => {
    return `
        <!DOCTYPE html>
        <html>
            <body>
                <h3>
                    Hello ${company.name}.
                </h3>
                <p>
                    Thank you for join to out website.
                </p>
            </body>
        </html>
    `;
};

export const tempPinEmail = (userName: string, tempPin: string): string => {
    return `
        <!DOCTYPE html>
        <html>
            <body>
                <h3>
                    Hello ${userName}.
                </h3>
                <p>
                    Here is your temporary pin "${tempPin}".
                </p>
            </body>
        </html>
    `;
};