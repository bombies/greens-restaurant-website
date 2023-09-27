import { authenticated } from "../../../../utils/api/ApiUtils";
import s3Client from "../../../../libs/s3-client";
import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
// @ts-ignore
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function GET(req: Request) {
    return authenticated(req, async () => {
        const { searchParams } = new URL(req.url);
        const key = searchParams.get("key");

        if (!key)
            return new NextResponse(undefined);

        const command = new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: key
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 });
        return NextResponse.json({ url });

    });
}