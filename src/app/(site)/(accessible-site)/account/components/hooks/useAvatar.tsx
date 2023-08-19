"use client";

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { UploadAvatarComponent } from "../UploadAvatarComponent";
import { InvoiceInformation, User } from "@prisma/client";

export const useCompanyAvatar = (
    data?: Partial<InvoiceInformation>,
    setData?: Dispatch<SetStateAction<Partial<InvoiceInformation> | undefined>>
) => {
    return useAvatar({
        data: {
            identifier: data?.id,
            fallbackSrc: data?.companyLogo,
            key: data?.companyAvatar
        },
        onUploadSuccess(key) {
            if (setData) {
                setData(prev => ({
                    ...prev,
                    companyAvatar: key
                }));
            }
        }
    });
};

export const useUserAvatar = (
    data?: Partial<User>,
    setData?: Dispatch<SetStateAction<Partial<User> | undefined>>
) => {
    return useAvatar({
        data: {
            identifier: data?.id,
            fallbackSrc: data?.image,
            key: data?.avatar
        },
        onUploadSuccess(key) {
            if (setData) {
                setData(prev => ({
                    ...prev,
                    avatar: key
                }));
            }
        }
    });
};

type Params = {
    data?: {
        identifier?: string,
        fallbackSrc?: string | null,
        key?: string | null,
    },
    onUploadStart?: () => void,
    onUploadSuccess?: (key: string) => void,
    onUploadError?: (error: string) => void,
}

export const useAvatar = ({
                              data,
                              onUploadSuccess,
                              onUploadError,
                              onUploadStart
                          }: Params) => {
    const [uploadState, setUploadState] = useState<"idle" | "uploading" | "error">("idle");
    const component = useMemo(() =>
            <UploadAvatarComponent
                isUploading={uploadState === "uploading"}
                data={data}
                disabled={uploadState === "uploading"}
                onUploadSuccess={(key) => {
                    setUploadState("idle");
                    if (onUploadSuccess)
                        onUploadSuccess(key);
                }}
                onUploadError={(err) => {
                    setUploadState("error");
                    if (onUploadError)
                        onUploadError(err);
                }}
                onUploadStart={() => {
                    setUploadState("uploading");
                    if (onUploadStart)
                        onUploadStart();
                }}
            />
        , [data, onUploadError, onUploadStart, onUploadSuccess, uploadState]);

    return { component, uploadState };
};