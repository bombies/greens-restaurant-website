import { User } from "@prisma/client";
import { getS3String } from "app/api/s3/s3-utils";

export const getUserAvatarString = (user?: User) => {
    return getUserAvatarStringHeadless(user?.avatar || undefined, user?.id, user?.image || undefined)
}

export const getUserAvatarStringHeadless = (
    avatar?: string | null,
    id?: string,
    fallback?: string | null
) => {
    return (avatar && id) ? getS3String(`images/users/${id}`, avatar) : (fallback ?? undefined)
}