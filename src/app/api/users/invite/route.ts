import { authenticated, Mailer, respond } from "../../../../utils/api/ApiUtils";
import { Permission } from "../../../../libs/types/permission";
import prisma from "../../../../libs/prisma";
import { v4 } from "uuid";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export type InviteDto = {
    firstName: string,
    lastName: string,
    username: string
    email: string
    permissions: number
}

export async function POST(req: Request) {
    return await authenticated(req, async () => {
        const { firstName, lastName, username, email, permissions }: InviteDto = await req.json();

        if (!username || !email || !permissions)
            return respond({ message: "Malformed payload!", init: { status: 401 } });

        const existingUser = await prisma.user.findMany({
            where: {
                OR: [
                    { username: username.toLowerCase() },
                    { email: email }
                ]
            }
        });

        if (existingUser.length !== 0)
            return respond({ message: "There is already a user with that email/username!", init: { status: 401 } });

        const password = v4();
        const mailInfo = await Mailer.sendMail({
            from: "\"Green's Pub\" <no-reply@robertify.me>",
            to: email,
            subject: "Website Invitation",
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
                        <h1>Hello <span class="primary-text">${firstName}</span>,</h1>
                        <p>Please see the login details below to access your account.</p>
                        <div class="details-container">
                          <p><span class="bold">Username:</span> ${username}</p>
                          <p><span class="bold">Password:</span> ${password}</p>
                        </div>
                      </main>
                    </div>
                  </body>
                </html>
            `
        });

        if (mailInfo.accepted.includes(email)) {
            const hashedPassword = await bcrypt.hash(password, 12);
            const createdUser = await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    username: username.toLowerCase(),
                    email: email.toLowerCase(),
                    permissions,
                    password: hashedPassword
                }
            });
            return NextResponse.json(createdUser);
        } else return respond({ message: "Could not send invitation email!", init: { status: 401 } });

    }, Permission.ADMINISTRATOR);
}