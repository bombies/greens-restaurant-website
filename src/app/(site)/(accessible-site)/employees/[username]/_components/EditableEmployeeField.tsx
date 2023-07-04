"use client";

import React, { MouseEventHandler, useState } from "react";
import { Spacer, Tooltip } from "@nextui-org/react";
import clsx from "clsx";
import GenericImage from "../../../../../_components/GenericImage";
import editIcon from "/public/icons/edit.svg";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericInput from "../../../../../_components/inputs/GenericInput";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import { sendToast } from "../../../../../../utils/Hooks";
import closeIcon from "/public/icons/close.svg";
import checkIcon from "/public/icons/check-green-circled.svg";
import GenericModal from "../../../../../_components/GenericModal";

interface Props {
    label: string,
    field?: string,
    capitalizeField?: boolean,
    onValueChange?: (value: string) => void
    validate?: {
        test: (value: string) => boolean,
        message?: string
    }
    successMessage?: string
    editAllowed: boolean
}

export default function EditableEmployeeField({
                                                  label,
                                                  field,
                                                  capitalizeField,
                                                  onValueChange,
                                                  validate,
                                                  successMessage,
                                                  editAllowed
                                              }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const {
        register,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>();

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        if (validate && !validate.test(data.value.trim())) {
            sendToast({
                description: validate.message || "Invalid input!",
                icon: closeIcon
            });

            return;
        }

        sendToast({
            description: successMessage || `Field updated! Make sure you save your changes.`,
            icon: checkIcon
        });

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
                    <GenericInput
                        register={register}
                        errors={errors}
                        id="value"
                        label={`New ${label}`}
                        required
                    />
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
    field?: string,
    onEdit?: MouseEventHandler<HTMLDivElement>
    capitalizeField?: boolean
    editAllowed: boolean
} & React.PropsWithChildren

export function DataContainer({ label, field, onEdit, capitalizeField, editAllowed, children }: DataContainerProps) {
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
            {
                children || <p className={clsx(
                    "max-w-sm overflow-clip",
                    capitalizeField && "capitalize"
                )}>{field}</p>
            }
        </div>
    );
}