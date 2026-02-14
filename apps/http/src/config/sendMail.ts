import { createTransport } from "nodemailer";

const transporter = createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "[EMAIL_ADDRESS]",
        pass: "[PASSWORD]",
    },
});

export const sendMail = async (to: string, subject: string, html: string) => {
    await transporter.sendMail({
        from: "kjlk",
        to,
        subject,
        html,
    });
};