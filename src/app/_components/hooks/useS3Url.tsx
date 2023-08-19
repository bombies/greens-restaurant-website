"use client";

import { useEffect, useState } from "react";
import { fetchS3Url } from "../../../utils/client-utils";

export const useS3Url = (key?: string | null) => {
    const [isLoading, setIsLoading] = useState(true);
    const [avatar, setAvatar] = useState<string>();

    useEffect(() => {
        fetchS3Url(key)
            .then(url => {
                setAvatar(url);
                setIsLoading(false);
            });
    }, [key]);

    return { avatar, isLoading };
};