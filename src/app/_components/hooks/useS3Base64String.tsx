"use client";

import { useEffect, useState } from "react";
import { FetchS3ObjectBuffer } from "../../../utils/client-utils";

export const useS3Base64String = (key?: string | null) => {
    const [avatar, setAvatar] = useState<string>();
    const { trigger: triggerFetch, isMutating: isLoading } = FetchS3ObjectBuffer();
    useEffect(() => {
        if (!key)
            return;

        triggerFetch({ key })
            .then(res => {
                setAvatar(res.data ? `data:image/*;base64, ${res.data}` : undefined);
            });
    }, [key, triggerFetch]);

    return { avatar, isLoading };
};