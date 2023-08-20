import * as process from "process";
import { authenticated } from "../../../../utils/api/ApiUtils";
import { NextResponse } from "next/server";
import s3Client from "../../../../libs/s3-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req: Request) {
    return authenticated(req, async () => {
        const { searchParams } = new URL(req.url);
        const fileName = searchParams.get("fileName");
        const fileType = searchParams.get("fileType");
        const key = searchParams.get("key");
        const command = new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: key ?? (fileName ?? undefined),
            ContentType: fileType ?? undefined
        });
        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });
        return NextResponse.json({ url });
    });
}