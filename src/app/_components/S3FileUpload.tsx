"use client"

import { FC, Fragment, ReactElement, RefObject, useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { Chip } from "@nextui-org/chip";
import { Button } from "@nextui-org/react";
import { CheckIcon } from "@nextui-org/shared-icons";
import { XIcon } from "lucide-react";
import { UploadFileToS3 } from "utils/client-utils";
import { FileSize } from "utils/FileSize";
import MediaType from "utils/MediaType";
import clsx from "clsx";

export type FileUploadProps = {
    data?: {
        identifier?: string,
        fallbackSrc?: string | null,
        path?: string,
        key?: string | null,
    };
    /**
     * The maximum size of a file.
     */
    maxFileSize?: FileSize,
    lazyServerUpload?: boolean,
    onUploadStart?: (file: File) => void,
    onLocalUploadSuccess?: (file: File) => void,
    onServerUploadSuccess?: (key: string, file: File) => void,
    onUploadError?: (error: string) => void,
    onFileSizeError?: (size: number) => void,
    onFileRemove?: () => void,
    isDisabled?: boolean,
    fileTypes: MediaType[]
    children?: (inputRef: RefObject<HTMLInputElement>, currentFileUrl?: string) => ReactElement | ReactElement[],
    className?: string,
    showToast?: boolean,
    toastOptions?: {
        uploadingMsg?: string,
        successMsg?: string,
        errorHandler?: (error: string) => any
    },
    showLazyFileName?: boolean,
}

export const S3FileUpload: FC<FileUploadProps> = ({
    data,
    maxFileSize,
    onFileSizeError,
    onLocalUploadSuccess,
    lazyServerUpload,
    onUploadStart,
    onServerUploadSuccess,
    onUploadError,
    onFileRemove,
    fileTypes,
    isDisabled: disabled,
    children,
    className,
    showToast,
    toastOptions,
    showLazyFileName
}) => {
    const [currentFile, setCurrentFile] = useState<File>()
    const { trigger: triggerUpload, isMutating: isUploading } = UploadFileToS3()
    const inputRef = useRef<HTMLInputElement>(null)

    const uploadFileToServer = useCallback(async (file: File) => {
        if (onUploadStart)
            onUploadStart(file);

        try {
            await triggerUpload({ file, key: data?.path && `${data.path}/${file.name}` });

            if (onServerUploadSuccess)
                onServerUploadSuccess(`${file.name}`, file);

            setCurrentFile(undefined)
            if (inputRef.current) {
                inputRef.current.value = ''
                inputRef.current.files = null
            }
        } catch (e: any) {
            if (onUploadError)
                onUploadError(e.message);
        }
    }, [data?.path, onServerUploadSuccess, onUploadError, onUploadStart, triggerUpload])

    return (
        <Fragment>
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={fileTypes.join(",")}
                disabled={disabled}
                onChange={async (e) => {
                    e.preventDefault()

                    const allFiles = e.target.files;
                    if (!allFiles || !allFiles.length) {
                        if (onFileRemove)
                            onFileRemove();
                        return Promise.resolve();
                    }

                    const file = allFiles[0];
                    if (maxFileSize && file.size > maxFileSize.toBytes()) {
                        if (onFileSizeError)
                            onFileSizeError(file.size)
                        else
                            toast.error("That file is too big!")
                        return;
                    }

                    setCurrentFile(file)
                    if (lazyServerUpload && onLocalUploadSuccess)
                        onLocalUploadSuccess(file);

                    const upload = async () => {
                        if (!lazyServerUpload)
                            return uploadFileToServer(file);
                    };

                    if (showToast) {
                        const defaultErrorHandler = (msg: string) => `There was an error uploading that image: ${msg}`;
                        if (!lazyServerUpload)
                            await toast.promise(
                                upload(),
                                {
                                    loading: toastOptions?.uploadingMsg ?? "Uploading image...",
                                    success: toastOptions?.successMsg ?? "Successfully uploaded image!",
                                    error: toastOptions?.errorHandler ?? defaultErrorHandler
                                }
                            )
                        else toast.success("Image uploaded successfully!")
                    } else await upload()

                    if (!lazyServerUpload) {
                        e.target.files = null
                        e.target.value = ''
                    }
                }}
            />
            <div className={clsx(
                "flex gap-4 phone:flex-col phone:items-center",
                className
            )}>
                {children && children(inputRef, currentFile ? URL.createObjectURL(currentFile) : undefined)}
                <AnimatePresence>
                    {(lazyServerUpload && currentFile) && (
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -200 }}
                            className="flex gap-4 bg-primary/10 rounded-2xl h-fit self-center p-2"
                        >
                            {showLazyFileName && (
                                <Chip
                                    variant="light"
                                    color="primary"
                                    className="self-center"
                                >{currentFile.name}</Chip>
                            )}
                            <Button
                                disabled={isUploading}
                                size="sm"
                                className="self-center"
                                variant="light"
                                isIconOnly
                                color="success"
                                onPress={async () => {
                                    const defaultErrorHandler = (msg: string) => `There was an error uploading that image: ${msg}`;
                                    await toast.promise(
                                        uploadFileToServer(currentFile),
                                        {
                                            loading: toastOptions?.uploadingMsg ?? "Uploading image...",
                                            success: toastOptions?.successMsg ?? "Successfully uploaded image!",
                                            error: toastOptions?.errorHandler ?? defaultErrorHandler
                                        }
                                    )
                                }}
                            >
                                <CheckIcon width={16} height={16} />
                            </Button>
                            <Button
                                disabled={isUploading}
                                size="sm"
                                variant="light"
                                className="self-center"
                                isIconOnly
                                color="danger"
                                onPress={() => {
                                    setCurrentFile(undefined)
                                    if (inputRef.current) {
                                        inputRef.current.value = ''
                                        inputRef.current.files = null
                                    }

                                    if (onFileRemove)
                                        onFileRemove()
                                }}
                            >
                                <XIcon width={16} height={16} />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Fragment>
    )
}

export default S3FileUpload