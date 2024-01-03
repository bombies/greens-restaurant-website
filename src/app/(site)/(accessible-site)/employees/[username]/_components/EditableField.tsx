"use client";

import React, { MouseEventHandler, useEffect, useState } from "react";
import { Skeleton, Spacer, Tooltip } from "@nextui-org/react";
import clsx from "clsx";
import GenericImage from "../../../../../_components/GenericImage";
import editIcon from "/public/icons/edit.svg";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericInput from "../../../../../_components/inputs/GenericInput";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import GenericModal from "../../../../../_components/GenericModal";
import GenericTextArea from "../../../../../_components/inputs/GenericTextArea";
import { toast } from "react-hot-toast";

interface Props {
    label: string,
    field?: string | null,
    fieldIsLoaded?: boolean,
    capitalizeField?: boolean,
    onValueChange?: (value: string) => void
    validate?: {
        test: (value: string) => boolean,
        message?: string
    }
    successMessage?: string,
    textArea?: boolean,
    editAllowed: boolean
}

export default function EditableField({
                                          label,
                                          field,
                                          fieldIsLoaded,
                                          capitalizeField,
                                          onValueChange,
                                          validate,
                                          successMessage,
                                          editAllowed,
                                          textArea
                                      }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [value, setValue] = useState<string>();
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
        if (validate && !validate.test(data.value.trim())) {
            toast.error(validate.message || "Invalid input!");
            return;
        }

        toast.success(successMessage || `Field updated! Make sure you save your changes.`);
        setModalOpen(false);
        if (onValueChange) {
            onValueChange(data.value.trim());
        }
    };

    return (
        <div>
            <DataContainer
                label={label}
                field={field}
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
                                register={register}
                                errors={errors}
                                id="value"
                                value={value}
                                onValueChange={setValue}
                                label={`New ${label}`}
                                required
                            />
                            :
                            <GenericInput
                                register={register}
                                errors={errors}
                                id="value"
                                value={value}
                                onValueChange={setValue}
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
    onEdit?: MouseEventHandler<HTMLDivElement>
    capitalizeField?: boolean
    editAllowed: boolean,
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
    const [editButtonShown, setEditButtonShown] = useState(false);

    return (
        <div
            className="default-container p-6 bg-secondary/10"
            onMouseEnter={() => {
                if (!editAllowed)
                    return;
                setEditButtonShown(true);
            }}
            onMouseLeave={() => {
                if (!editAllowed)
                    return;
                setEditButtonShown(false);
            }}
        >
            <div className="flex gap-4">
                <p className="text-primary text-xl phone:text-lg capitalize">{label}</p>
                <Tooltip
                    isDisabled={!editAllowed}
                    color="secondary"
                    content="Edit"
                >
                    <div
                        className={clsx(
                            "transition-fast flex flex-col justify-center",
                            editButtonShown ? "opacity-100" : "opacity-0",
                            editAllowed ? "cursor-pointer" : "cursor-default"
                        )}
                        onClick={(event) => {
                            if (!editAllowed)
                                return;

                            if (onEdit)
                                onEdit(event);
                        }}
                    >
                        <GenericImage src={editIcon} width={1} />
                    </div>
                </Tooltip>
            </div>
            <Spacer y={2} />
            <Skeleton
                isLoaded={fieldIsLoaded || fieldIsLoaded === undefined}
                className={clsx(
                    "rounded-2xl",
                    (fieldIsLoaded || fieldIsLoaded === undefined) ? "!bg-transparent" : "w-1/2 h-5 p-4"
                )}
            >
                {
                    children || <p className={clsx(
                        "max-w-fit break-all whitespace-pre-wrap !bg-red",
                        capitalizeField && "capitalize"
                    )}>{field}</p>
                }
            </Skeleton>
        </div>
    );
}