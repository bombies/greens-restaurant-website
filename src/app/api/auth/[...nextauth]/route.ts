import NextAuth, { AuthOptions, DefaultSession, DefaultUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import prisma from "../../../../libs/prisma";
import { DefaultJWT } from "next-auth/jwt";

export const authHandler: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "email", type: "text" },
                password: { label: "password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials) throw new Error("Missing credentials!");

                const user = (await prisma.user.findMany({
                    where: {
                        OR: [
                            { email: credentials.email },
                            { username: credentials.email }
                        ]
                    }
                }))[0];
                if (!user) throw new Error("Invalid credentials!");

                const result = await compare(credentials.password, user.password);
                if (result)
                    return user;
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

const handler = NextAuth(authHandler);

declare module "next-auth" {
    interface User extends DefaultUser {
        username: string;
        permissions: number;
        firstName: string;
        lastName: string;
    }

    interface Session extends DefaultSession {
        user?: User;
        accessToken?: string,
    }
}

export { handler as GET, handler as POST };