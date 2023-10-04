import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { ReactElement } from "react";
import {
    StockRequestWithOptionalExtras
} from "../../../app/(site)/(accessible-site)/inventory/_components/requests/inventory-requests-utils";
import { User } from "@prisma/client";
import InventoryRequestAssignedEmail from "../../../../emails/InventoryRequestAssignedEmail";
import EmailUpdateEmail from "../../../../emails/EmailUpdateEmail";
import InviteEmail from "../../../../emails/InviteEmail";

export class Mailer {
    private static readonly transporter = nodemailer.createTransport({
        host: process.env.MAILER_HOST,
        port: Number(process.env.MAILER_PORT),
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.MAILER_USER,
            pass: process.env.MAILER_PASSWORD
        }
    });

    private static defaultOptions: Mail.Options = {
        from: "\"Green's Pub\" <no-reply@robertify.me>"
    };

    public static async sendMail({ to, subject, body }: {
        to: string | string[],
        subject: string,
        body: ReactElement
    }) {
        const ReactDOMServer = (await import("react-dom/server")).default;
        return Mailer.transporter.sendMail({
            ...Mailer.defaultOptions,
            subject,
            to,
            html: ReactDOMServer.renderToStaticMarkup(body)
        });
    }

    public static async sendDashboardInvite(to: string, firstName: string, username: string, password: string) {
        return Mailer.sendMail({
            to,
            subject: "Dashboard Invitation",
            body: (
                <InviteEmail
                    firstName={firstName}
                    username={username}
                    password={password}
                    intendedFor={to}
                />
            )
        });
    }

    public static async sendEmailUpdate({ to, firstName, email, username }: {
        to: string,
        firstName: string,
        username: string,
        email: string
    }) {
        return Mailer.sendMail({
            to,
            subject: "Email Update",
            body: (
                <EmailUpdateEmail
                    firstName={firstName}
                    username={username}
                    email={email}
                    intendedFor={to}
                />
            )
        });
    }

    public static async sendInventoryRequestAssignment({ assignees, request }: {
        assignees: User[],
        request: StockRequestWithOptionalExtras
    }) {
        const mailPromises = assignees.map(assignee => Mailer.sendMail({
            to: assignee.email,
            subject: "Inventory Request Assignment",
            body: <InventoryRequestAssignedEmail
                assignee={assignee}
                request={request}
                intendedFor={assignee.email}
            />
        }));
        return Promise.all(mailPromises);
    }
}