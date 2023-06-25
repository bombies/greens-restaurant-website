import { createTransport } from "nodemailer";
import Mail from "nodemailer/lib/mailer";

const transporter = createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_ADDRESS, pass: process.env.EMAIL_PASSWORD }
});

export const sendMail = async (mail: Mail.Options) => {
    return await transporter.sendMail(mail);
}

export type InvitationUser = {
    email: string,
    first_name: string,
    last_name: string,
    username: string,
    password: string
}

export const sendInvitationEmail = async (user: InvitationUser) => {
    return await sendMail({
        from: "Green's Restaurant & Pub",
        to: process.env.NODE_ENV == "production" ? user.email : 'ajani.green@outlook.com',
        subject: "Invitation to Company Website",
        html: `
          <h1>${user.first_name}, welcome to Green's Restaurant & Pub's staff team.</h1>
          <p>Your login information is:</p>
          <p>Username: ${user.username}</p>
          <p>Password: ${user.password}</p>
        `,
    })
}