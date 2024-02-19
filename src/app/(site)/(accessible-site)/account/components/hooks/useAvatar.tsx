"use client";

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { UploadAvatarComponent, UploadAvatarComponentProps } from "../UploadAvatarComponent";
import { InvoiceInformation, User } from "@prisma/client";

export const useCompanyAvatar = (
    data?: Partial<InvoiceInformation>,
    setData?: Dispatch<SetStateAction<Partial<InvoiceInformation> | undefined>>
) => {
    return useAvatar({
        data: {
            path: "images/company",
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
            path: data?.id && `images/users/${data.id}`,
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

type Params = Omit<UploadAvatarComponentProps, "onFileRemove" | "disabled">

export const useAvatar = ({
                              data,
                              onUploadSuccess,
                              onUploadError,
                              onUploadStart
                          }: Params) => {
    const [uploadState, setUploadState] = useState<"idle" | "uploading" | "error">("idle");
    const component = useMemo(() =>
            <UploadAvatarComponent
                data={data}
                isDisabled={uploadState === "uploading"}
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