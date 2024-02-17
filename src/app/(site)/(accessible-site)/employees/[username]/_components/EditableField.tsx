"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Skeleton, Spacer } from "@nextui-org/react";
import clsx from "clsx";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericInput from "../../../../../_components/inputs/GenericInput";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import GenericModal from "../../../../../_components/GenericModal";
import GenericTextArea from "../../../../../_components/inputs/GenericTextArea";
import { toast } from "react-hot-toast";

interface Props<T extends string | number = string> {
    label: string,
    field?: T | null,
    fieldIsLoaded?: boolean,
    capitalizeField?: boolean,
    onValueChange?: (value: T) => void
    validate?: {
        test: (value: T) => boolean,
        message?: string
    }
    successMessage?: string,
    textArea?: boolean,
    editAllowed?: boolean,
}

export default function EditableField<T extends string | number = string>({
    label,
    field,
    fieldIsLoaded,
    capitalizeField,
    onValueChange,
    validate,
    successMessage,
    editAllowed,
    textArea,
}: Props<T>) {
    const [modalOpen, setModalOpen] = useState(false);
    const [value, setValue] = useState<T | undefined | null>(field);
    const {
        register,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>();

    useEffect(() => {
        if (fieldIsLoaded && field)
            setValue(field);
    }, [field, fieldIsLoaded]);

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        if (!value) return;

        if (validate && !validate.test(data.value.trim())) {
            toast.error(validate.message || "Invalid input!");
            return;
        }

        toast.success(successMessage || `Field updated! Make sure you save your changes.`);
        setModalOpen(false);
        if (onValueChange) {
            onValueChange(value);
        }
    };

    return (
        <div>
            <DataContainer
                label={label}
                field={field?.toString()}
                fieldIsLoaded={fieldIsLoaded}
                capitalizeField={capitalizeField}
                onEdit={() => setModalOpen(true)}
                editAllowed={editAllowed}
            />
            <GenericModal
                title={`Edit ${label}`}
                isOpen={modalOpen && editAllowed}
                onClose={() => setModalOpen(false)}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    {
                        textArea ?
                            <GenericTextArea
                                type={typeof field === 'number' ? "number" : "text"}
                                register={register}
                                errors={errors}
                                id="value"
                                value={value?.toString()}
                                onValueChange={(value) => {
                                    if (typeof field === 'number')
                                        setValue(parseInt(value) as T)
                                    else
                                        setValue(value as T)
                                }}
                                label={`New ${label}`}
                                required
                            />
                            :
                            <GenericInput
                                type={typeof field === 'number' ? "number" : "text"}
                                register={register}
                                errors={errors}
                                id="value"
                                value={value?.toString()}
                                onValueChange={(value) => {
                                    if (typeof field === 'number')
                                        setValue(parseInt(value) as T)
                                    else
                                        setValue(value as T)
                                }}
                                label={`New ${label}`}
                                required
                            />
                    }
                    <Spacer y={6} />
                    <GenericButton type="submit">
                        Update
                    </GenericButton>
                </form>
            </GenericModal>
        </div>
    );
}

type DataContainerProps = {
    label: string,
    field?: string | null,
    fieldIsLoaded?: boolean,
    onEdit?: () => void
    capitalizeField?: boolean
    editAllowed?: boolean,
} & React.PropsWithChildren

export function DataContainer({
    label,
    field,
    fieldIsLoaded,
    onEdit,
    capitalizeField,
    editAllowed,
    children
}: DataContainerProps) {

    const contentElement = useMemo(() => (
        children ||
        (!editAllowed ?
            <p className={clsx(
                "max-w-fit break-all whitespace-pre-wrap !bg-red",
                capitalizeField && "capitalize",
            )}>{field}</p>
            : (
                <GenericButton
                    color="default"
                    variant="light"
                    isDisabled={fieldIsLoaded === false}
                    onPress={() => {
                        onEdit?.()
                    }}
                >
                    {field}
                </GenericButton>
            )
        )
    ), [capitalizeField, children, editAllowed, field, fieldIsLoaded, onEdit])

    return (
        <div
            className="default-container p-6 bg-secondary/10"
        >
            <div className="flex gap-4">
                <p className="text-primary text-xl phone:text-lg capitalize">{label}</p>
            </div>
            <Spacer y={2} />
            {fieldIsLoaded === true || fieldIsLoaded === false ? (
                <Skeleton
                    isLoaded={fieldIsLoaded}
                    className={clsx(
                        "rounded-2xl",
                        (fieldIsLoaded) ? "!bg-transparent" : "w-1/2 h-5 p-4"
                    )}
                >
                    {contentElement}
                </Skeleton>
            ) : (
                <>{contentElement}</>
            )}
        </div>
    );
}