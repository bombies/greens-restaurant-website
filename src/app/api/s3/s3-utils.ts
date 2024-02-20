export const getS3String = (path: string, key: string) => {
    return `/api/s3?key=${path}/${encodeURIComponent(key)}`;
}