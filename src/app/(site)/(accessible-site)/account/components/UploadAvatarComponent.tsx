"use client";

import React, { FC } from "react";
import { Avatar } from "@nextui-org/avatar";
import { getS3String } from "app/api/s3/s3-utils";
import S3FileUpload from "app/_components/S3FileUpload";
import MediaType from "utils/MediaType";
import { MegaBytes } from "utils/FileSize";

export interface UploadAvatarComponentProps {
    data?: {
        identifier?: string,
        fallbackSrc?: string | null,
        path?: string,
        key?: string | null,
    };
    onUploadStart?: () => void,
    onUploadSuccess?: (key: string) => void,
    onUploadError?: (error: string) => void,
    onFileRemove?: () => void,
    isDisabled?: boolean
}

export const UploadAvatarComponent: FC<UploadAvatarComponentProps> = ({
    data,
    onUploadSuccess,
    onFileRemove,
    onUploadError,
    onUploadStart,
    isDisabled
}) => {
    return (
        <S3FileUpload
            isDisabled={isDisabled}
            fileTypes={[MediaType.IMAGE]}
            data={data}
            maxFileSize={MegaBytes.from(20)}
            lazyServerUpload
            onUploadStart={onUploadStart}
            onServerUploadSuccess={onUploadSuccess}
            onUploadError={onUploadError}
            onFileRemove={onFileRemove}
            className="w-fit"
        >
            {(ref, currentFile) => (
                <Avatar
                    src={currentFile || (data?.key ? getS3String(data.path ?? "", data.key) : (data?.fallbackSrc || undefined))}
                    as="button"
                    onClick={() => ref.current?.click()}
                    isBordered={true}
                    isDisabled={isDisabled}
                    className="transition-fast hover:brightness-150 cursor-pointer w-36 phone:w-16 h-36 phone:h-16"
                />
            )}
        </S3FileUpload>
    );
};