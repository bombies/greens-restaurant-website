import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../../libs/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";

export const authHandler: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "email", type: "text" },
                password: { label: "password", type: "password" }
            },
            // @ts-ignore
            async authorize(credentials) {
                if (!credentials) throw new Error("Missing credentials!");

                const fetchedUser = (await prisma.user.findMany({
                    where: {
                        OR: [
                            { email: credentials.email },
                            { username: credentials.email }
                        ]
                    }
                }))[0];
                if (!fetchedUser) throw new Error("Invalid credentials!");

                const result = await compare(credentials.password, fetchedUser.password);
                const { username, firstName, lastName, id, ...user } = fetchedUser;
                if (result)
                    return { username, firstName, lastName, id };
                else throw new Error("Invalid credentials!");
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60 // 1 day
    },
    jwt: {
        maxAge: 24 * 60 * 60 // 1 day
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (user)
                token = { ...token, ...user };
            token.accessToken = account?.access_token;
            return token;
        },
        session({ token, session }) {
            if (token && session.user)
                session.user = { ...session.user, ...token };

            session.accessToken = token.accessToken as string;
            return session;
        }
    },
    debug: process.env.NODE_ENV === "development",
    secret: process.env.NEXTAUTH_SECRET
};