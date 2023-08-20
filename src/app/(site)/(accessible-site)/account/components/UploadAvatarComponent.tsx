"use client";

import React, { FC, Fragment, useRef } from "react";
import { Avatar } from "@nextui-org/avatar";
import { Input } from "@nextui-org/input";
import { toast } from "react-hot-toast";
import { useS3Base64String } from "../../../../_components/hooks/useS3Base64String";
import clsx from "clsx";
import { Skeleton } from "@nextui-org/react";
import { UploadFileToS3 } from "../../../../../utils/client-utils";

interface Props {
    data?: {
        identifier?: string,
        fallbackSrc?: string | null,
        key?: string | null,
    };
    onUploadStart?: () => void,
    onUploadSuccess?: (key: string) => void,
    onUploadError?: (error: string) => void,
    onFileRemove?: () => void,
    disabled?: boolean
}

export const UploadAvatarComponent: FC<Props> = ({
                                                     data,
                                                     onUploadSuccess,
                                                     onFileRemove,
                                                     onUploadError,
                                                     onUploadStart,
                                                     disabled
                                                 }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { avatar } = useS3Base64String(data?.key);
    const { trigger: triggerUpload, isMutating: isUploading } = UploadFileToS3();

    return (
        <Fragment>
            <Input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                    const upload = async () => {
                        if (onUploadStart)
                            onUploadStart();

                        const allFiles = e.target.files;
                        if (!allFiles || !allFiles.length) {
                            if (onFileRemove)
                                onFileRemove();
                            return Promise.resolve();
                        }
                        const file = allFiles[0];
                        return triggerUpload({
                            file: file
                        }).then(() => {
                                if (onUploadSuccess)
                                    onUploadSuccess(`${file.name}`);
                            }
                        ).catch(e => {
                            if (onUploadError)
                                onUploadError(e.message);
                        });
                    };

                    await toast.promise(
                        upload(),
                        {
                            loading: "Uploading new avatar...",
                            success: "Successfully updated new avatar!",
                            error(msg: string) {
                                return `There was an error uploading a new avatar: ${msg}`;
                            }
                        }
                    );
                }}
            />
            <Skeleton
                isLoaded={!isUploading}
                className={clsx(
                    "rounded-full p-1 flex items-center justify-center",
                    !isUploading && "!bg-transparent"
                )}>
                <Avatar
                    src={avatar || (data?.fallbackSrc || undefined)}
                    as="button"
                    onClick={() => inputRef.current?.click()}
                    isBordered={true}
                    isDisabled={disabled}
                    className="transition-fast hover:brightness-150 cursor-pointer w-36 phone:w-16 h-36 phone:h-16"
                />
            </Skeleton>
        </Fragment>
    );
};