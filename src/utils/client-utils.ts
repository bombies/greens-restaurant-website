"use client";

import { Storage } from "aws-amplify";

export const downloadFileFromBlob = async (blob: Blob, fileName: string) => {
    const objUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = objUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const fetchS3Url = async (key?: string | null): Promise<string | undefined> => {
    return key ? Storage.get(key) : undefined
}