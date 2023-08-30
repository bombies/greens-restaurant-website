import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { FC, Fragment, ReactElement } from "react";
import {
    StockRequestWithOptionalExtras
} from "../../app/(site)/(accessible-site)/inventory/_components/requests/inventory-requests-utils";
import { User } from "@prisma/client";

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
                <Mailer.InviteEmail
                    firstName={firstName}
                    username={username}
                    password={password}
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
                <Mailer.EmailUpdateEmail
                    firstName={firstName}
                    username={username}
                    email={email}
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
            body: <Mailer.InventoryRequestAssignedEmail
                assignee={assignee}
                request={request}
            />
        }));
        return Promise.all(mailPromises);
    }


    private static InventoryRequestAssignedEmail: FC<{
        request: StockRequestWithOptionalExtras,
        assignee: User
    }> = ({ assignee, request }) =>
        Mailer.prepareMailContent(
            <Fragment>
                <h1>Hello <span className="primary-text">{assignee.firstName}</span>,</h1>
                <p>You&apos;ve been assigned an inventory request by <span
                    className="primary-text">{request.requestedByUser ? `${request.requestedByUser.firstName} ${request.requestedByUser.lastName}` : "Unknown"}</span>
                </p>
                <br /><br />
                <ul>
                    {request.requestedItems?.map(item => (
                        <li key={item.id}>{`x${item.amountRequested} ${item.stock?.name}`}</li>
                    ))}
                </ul>
                <br />
                <p>Please <a href={`https://greensres.ajani.me/inventory/requests/${request.id}`}>review this
                    request</a> as soon as possible.</p>
            </Fragment>
        );

    private static EmailUpdateEmail: FC<{
        firstName: string,
        username: string,
        email: string,
    }> = ({ firstName, username, email }) => Mailer.prepareMailContent(
        <Fragment>
            <h1>Hello <span className="primary-text">{firstName}</span>,</h1>
            <p>Your email for account with username <b>${username}</b> has been updated to this one. (${email})</p>
        </Fragment>
    );

    private static InviteEmail: FC<{
        firstName: string,
        username: string,
        password: string
    }> = ({
              firstName,
              username,
              password
          }) => Mailer.prepareMailContent(
        <Fragment>
            <h1>Hello <span className="primary-text">{firstName}</span>,</h1>
            <p>Please see the login details below to access your account. Click <a
                href="https://greensres.ajani.me">here</a> to access the website.</p>
            <br />
            <br />
            <p><span className="bold primary-text">Username: </span>{username}</p>
            <p><span className="bold primary-text">Password: </span>{password}</p>
        </Fragment>
    );

    private static prepareMailContent = (content: ReactElement) => {
        const css = `
                      .primary-text {
                        color: #00D615;
                      }
                      
                      .bold {
                        font-weight: 700;
                      }
                      
                      .container-width: {
                        width: 50%
                      }
                      
                      @media (max-width: 1025px) {
                        .container-width: {
                            width: 100%
                        }
                      }
        `;

        return (
            <html>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap"
                    rel="stylesheet" />
                <style>{css}</style>
            </head>
            <body style={{
                backgroundColor: "white",
                color: "black",
                fontFamily: "'Inter', sans-serif"
            }}>
            <div style={{
                display: "flex",
                justifyContent: "center"
            }}>
                <div className="container-width">
                    <div style={{
                        backgroundImage: "linear-gradient(to right, #007d0d, #00D615)",
                        padding: "1em"
                    }}>
                        <a href="https://greensres.ajani.me">
                            <img src="https://i.imgur.com/HLTQ78m.png" alt="" width="128" height="128" />
                        </a>
                    </div>
                    <main style={{
                        padding: "2rem"
                    }}>
                        {content}
                    </main>
                </div>
            </div>
            </body>
            </html>
        );
    };
}