import { authenticated, Mailer, respond, respondWithInit } from "../../../../utils/api/ApiUtils";
import { NextResponse } from "next/server";
import prisma from "../../../../libs/prisma";
import { EMAIL_REGEX, PASSWORD_REGEX } from "../../../../utils/regex";
import bcrypt from "bcrypt";
import { z } from "zod";

export async function GET(req: Request) {
    return await authenticated(req, async (session) => {
        const user = await prisma.user.findUnique({
            where: { username: session.user?.username }
        });

        if (!user)
            return respond({
                message: `There was no user with the username: ${session.user?.username}`,
                init: { status: 404 }
            });
        const { password, ...rest } = user;
        return NextResponse.json(rest);
    });
}

type UpdateUserDto = Partial<{
    email: string
    password: string,
    avatar: string | null
}>
const updateUserDtoSchema = z.object({
    email: z.string(),
    password: z.string(),
    avatar: z.string()
}).partial();

export async function PATCH(req: Request) {
    return await authenticated(req, async (session) => {
        const user = await prisma.user.findUnique({
            where: { username: session.user?.username }
        });

        if (!user)
            return respond({
                message: `There was no user with the username: ${session.user?.username}`,
                init: { status: 404 }
            });


        const body: UpdateUserDto = await req.json();
        const bodyValidated = updateUserDtoSchema.safeParse(body);
        if (!body)
            return respondWithInit({
                message: "You must provide some information to update!",
                status: 401,
                validationErrors: bodyValidated
            });

        // Validation
        if (body.password) {
            if (!PASSWORD_REGEX.test(body.password))
                return respond({
                    message: "The password must be between 6 and 256 characters!",
                    init: {
                        status: 401
                    }
                });
            body.password = await bcrypt.hash(body.password, 12);
        }

        if (body.email && body.email !== user.email) {
            if (!EMAIL_REGEX.test(body.email))
                return respond({
                    message: "Invalid email!",
                    init: { status: 401 }
                });

            const existingUser = await prisma.user.findUnique({
                where: {
                    email: body.email
                }
            });

            if (existingUser)
                return respond({
                    message: `There is already a user with the email: ${body.email}`,
                    init: { status: 401 }
                });

            await Mailer.sendMail({
                from: "\"Green's Pub\" <no-reply@robertify.me>",
                to: body.email,
                subject: "Email Updated",
                html: `
                <!DOCTYPE HTML>
                <html>
                  <head>
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap" rel="stylesheet">
                    <style>
                      body {
                        background-color: white;
                        font-family: "Inter", sans-serif;
                      }
                      
                      main {
                        padding: 2rem;+
                      }
                
                      .banner {
                        background-image: linear-gradient(to right, #007d0d, #00D615);
                        padding: 1rem;
                      }
                
                      .primary-text {
                        color: #00D615;
                      }
                
                      .details-container {
                        margin-top: 4rem;
                        padding: 4rem 2rem;
                        background: #00D615;
                        border-radius: 16px;
                        width: fit-content;
                        box-shadow: 0 0px 0px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
                      }
                      
                      .bold {
                        font-weight: 700;
                      }
                
                    </style>
                  </head>
                
                  <body>
                    <div>
                      <div class="banner">
                        <img src="https://i.imgur.com/HLTQ78m.png" alt="" width="128" height="128" />
                      </div>
                      <main>
                        <h1>Hello <span class="primary-text">${user.firstName}</span>,</h1>
                        <p>Your email for account with username <b>${user.username}</b> has been updated to this one. (${body.email})</p>
                      </main>
                    </div>
                  </body>
                </html>
            `
            });
        }

        const updatedUser = await prisma.user.update({
            where: {
                username: user.username
            },
            data: {
                email: body.email,
                avatar: body.avatar,
                password: body.password
            }
        });

        return NextResponse.json(updatedUser);
    });
}