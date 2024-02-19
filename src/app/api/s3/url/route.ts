import { authenticated } from "../../../../utils/api/ApiUtils";
import s3Client from "../../../../libs/s3-client";
import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
// @ts-ignore
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios, { AxiosError } from "axios";
import { buildResponse } from "app/api/utils/utils";
import { fileTypeFromBuffer } from "file-type";

export async function GET(req: Request) {
    return authenticated(req, async () => {
        const { searchParams } = new URL(req.url);
        const key = searchParams.get("key");

        if (!key)
            return new NextResponse(undefined);

        const command = new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: key.trim()
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 });

        try {
            const img = Buffer.from((await axios.get<string>(url)).data, "utf-8");
            const res = new NextResponse(img)
            res.headers.set("Content-Type", (await fileTypeFromBuffer(img))?.mime ?? "image/png");
            return res
        } catch (e) {
            if (e instanceof AxiosError)
                return buildResponse({
                    status: e.response?.status,
                    data: e.response?.data
                });
            else throw e
        }
    });
}