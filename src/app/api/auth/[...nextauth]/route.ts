import NextAuth, { DefaultSession } from "next-auth";
import { authHandler } from "./utils";

const handler = NextAuth(authHandler);

declare module "next-auth" {
    interface User {
        username: string;
        firstName: string;
        lastName: string;
    }

    interface Session extends DefaultSession {
        user?: User;
        accessToken?: string,
    }
}

export { handler as GET, handler as POST };