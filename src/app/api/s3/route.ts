import { authenticated } from "../../../utils/api/ApiUtils";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import * as process from "process";
import s3Client from "../../../libs/s3-client";
import { NextResponse } from "next/server";
import { Buffer } from "buffer";
import { fileTypeFromBuffer } from "file-type";

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

        const res = await s3Client.send(command);
        const objectData = await res.Body?.transformToByteArray();
        if (!objectData)
            return new NextResponse(undefined);
        const buf = Buffer.from(objectData);
        const response = new NextResponse(buf);
        response.headers.set("Content-Type", (await fileTypeFromBuffer(buf))?.mime ?? "image/png");
        return response;
    });
}