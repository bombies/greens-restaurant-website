import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/",
    },
});

export const config = {
    matcher: [
        "/home/:path*",
        "/employees/:path*",
        "/bar/:path*",
        "/inventory/:path*",
        "/management/:path*",
        "/account/:path*",
        "/invoices/:path*",
    ]
};