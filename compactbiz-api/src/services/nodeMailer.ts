import { Transporter, SendMailOptions, createTransport } from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";

export class NodeMailer {

    private readonly transporter: Transporter;
    private mailOptions: Pick<SendMailOptions, "from" | "to" | "subject" | "text" | "html">;

    public constructor() {
        this.transporter = createTransport(smtpTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 587,
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS
            },
            tls: {
                ciphers: "SSLv3",
                rejectUnauthorized: false
            }
        }));
        this.mailOptions = {
            from: process.env.NODEMAILER_USER,
            to: "",
            subject: "",
            text: "",
            html: ""
        };
    }

    public to(to: string): NodeMailer {
        this.mailOptions.to = to;
        return this;
    }

    public subject(subject: string): NodeMailer {
        this.mailOptions.subject = subject;
        return this;
    }

    public text(text: string): NodeMailer {
        this.mailOptions.text = text;
        return this;
    }

    public html(html: string): NodeMailer {
        this.mailOptions.html = html;
        return this;
    }

    public async send(): Promise<void> {
        await this.transporter.sendMail(this.mailOptions);
    }

}