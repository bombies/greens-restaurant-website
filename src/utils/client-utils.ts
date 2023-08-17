"use client";

export const downloadFileFromBlob = async (blob: Blob, fileName: string) => {
    const objUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = objUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};