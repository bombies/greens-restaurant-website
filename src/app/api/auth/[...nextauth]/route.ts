import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { PrismaAdapter } from "@next-auth/prisma-adapter"

import prisma from "../../../../libs/prisma"

export const authHandler: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'email', type: 'text' },
                password: { label: 'password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials) throw new Error("Missing credentials!")

                const user = (await prisma.user.findMany({
                    where: {
                        OR: [
                            { email: credentials.email },
                            { username: credentials.email },
                        ]
                    }
                }))[0]
                if (!user) throw new Error("Invalid credentials!")

                const result = await compare(credentials.password, user.password)
                if (result)
                    return user
                else throw new Error("Invalid credentials!")
            }
        })
    ],
    session: {
        strategy: 'jwt'
    },
    debug: process.env.NODE_ENV === 'development',
    secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authHandler)
export { handler as GET, handler as POST }