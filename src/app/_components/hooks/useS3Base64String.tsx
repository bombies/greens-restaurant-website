"use client";

import { useEffect, useState } from "react";
import { FetchS3ObjectBuffer, FetchS3ObjectUrl } from "../../../utils/client-utils";
import { User } from "@prisma/client";

export const useS3AvatarUrls = (users: Partial<User>[]) => {
    const [avatars, setAvatars] = useState<{ avatar?: string, userId: string }[]>();
    const { trigger: triggerFetch, isMutating: isLoading } = FetchS3ObjectUrl();

    useEffect(() => {
        if (!users)
            return;

        users.forEach(async (user) => {
            if (user.avatar && user.id) {
                await triggerFetch({ key: `images/users/${user.id}/${user.avatar}` })
                    .then(res => {
                        setAvatars(prev => {
                            if (!prev)
                                return [{
                                    userId: user.id!,
                                    avatar: res.data.url
                                }];
                            return [
                                ...prev,
                                {
                                    userId: user.id!,
                                    avatar: res.data.url
                                }
                            ];
                        });
                    });
            }
        });
    }, [triggerFetch, users]);

    return { avatars, isLoading };
};

export const useS3Base64AvatarStrings = (users: Partial<User>[]) => {
    const [avatars, setAvatars] = useState<{ avatar?: string, userId: string }[]>();
    const { trigger: triggerFetch, isMutating: isLoading } = FetchS3ObjectBuffer();

    useEffect(() => {
        if (!users)
            return;

        users.forEach(async (user) => {
            if (user.avatar && user.id) {
                await triggerFetch({ key: `images/users/${user.id}/${user.avatar}` })
                    .then(res => {
                        setAvatars(prev => {
                            if (!prev)
                                return [{
                                    userId: user.id!,
                                    avatar: res.data ? `data:image/*;base64, ${res.data}` : undefined
                                }];
                            return [
                                ...prev,
                                {
                                    userId: user.id!,
                                    avatar: res.data ? `data:image/*;base64, ${res.data}` : undefined
                                }
                            ];
                        });
                    });
            }
        });
    }, [triggerFetch, users]);

    return { avatars, isLoading };
};

export const useS3Base64AvatarString = (userId: string, avatar?: string | null) => {
    return useS3Base64String(avatar && `images/users/${userId}/${avatar}`);
};

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

export const useS3UserAvatarUrl = (userId: string, avatar?: string | null) => {
    return useS3ObjectUrl(avatar && `images/users/${userId}/${avatar}`);
};

export const useS3ObjectUrl = (key?: string | null) => {
    const [url, setUrl] = useState<string>();
    const { trigger: triggerFetch, isMutating: isLoading } = FetchS3ObjectUrl();
    useEffect(() => {
        if (!key)
            return;

        triggerFetch({ key })
            .then(res => {
                setUrl(res.data.url);
            });
    }, [key, triggerFetch]);

    return { url, isLoading };
};