"use client";

import axios from "axios";
import useSWRMutation from "swr/mutation";

export const downloadFileFromBlob = async (blob: Blob, fileName: string) => {
    const objUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = objUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

type S3FileFetchArgs = {
    arg: {
        key?: string | null
    }
}

export const FetchS3ObjectBuffer = () => {
    const fetcher = (url: string, { arg }: S3FileFetchArgs) => axios.get(url.replaceAll("{key}", arg.key || ""));
    return useSWRMutation(`/api/s3?key={key}`, fetcher);
};

type S3FileUploadArgs = {
    arg: {
        file: File,
        key?: string,
    }
}

export const UploadFileToS3 = () => {
    const mutator = async (url: string, { arg }: S3FileUploadArgs) => {
        const { file } = arg;
        const {
            url: postUrl,
            fields
        } = (await axios.post(
            url.replaceAll("{file_name}", file.name)
                .replaceAll("{file_type}", file.type)
                .replaceAll("{key}", arg.key ?? "")
        )).data;

        const formData = new FormData();
        Object.entries(({ ...fields, file }))
            .forEach(([key, value]) => {
                formData.append(key, value as string);
            });
        return axios.put(postUrl, file, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    };
    return useSWRMutation(`/api/s3/upload?fileName={file_name}&fileType=$file_type}&key={key}`, mutator);
};