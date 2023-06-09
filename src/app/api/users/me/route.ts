import { authenticated } from "../../../../utils/api/ApiUtils";
import { NextResponse } from "next/server";

export async function GET() {
    return await authenticated(async (session) => {
        return NextResponse.json(session.user);
    });
}