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
        "/inventory/:path*",
        "/management/:path*",
    ]
};