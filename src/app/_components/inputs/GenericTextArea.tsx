"use client";

import { StaticImageData } from "next/image";
import GenericImage from "../GenericImage";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { InputProps, Textarea } from "@nextui-org/input";
import clsx from "clsx";
import { SlotsToClasses } from "@nextui-org/react";

interface Props extends InputProps {
    id: string;
    register?: UseFormRegister<FieldValues>;
    errors?: FieldErrors,
    iconLeft?: string | StaticImageData;
    iconRight?: string | StaticImageData;
}

export default function GenericTextArea({ id, register, errors, iconLeft, iconRight, radius, type, ...props }: Props) {
    const className: SlotsToClasses<"description" | "errorMessage" | "label" | "base" | "mainWrapper" | "inputWrapper" | "innerWrapper" | "input" | "clearButton" | "helperWrapper"> | undefined
        = {
        inputWrapper: clsx(
            "transition-fast ring-2 bg-dark ring-neutral-800 hover:ring-primary hover:-translate-y-[0.15rem]",
            "group-data-[focused=true]:ring-primary",
            errors && (errors[id] && "ring-danger")
        ),
        input: "placeholder:text-neutral-600",
        label: "text-neutral-100",
    };

    return register ?
        <Textarea
            {...register(id, { required: props.required })}
            {...props}
            radius={radius || "lg"}
            startContent={
                props.startContent || (iconLeft && <GenericImage src={iconLeft} width={1.25} />)
            }
            endContent={
                props.endContent ||
                (iconRight && <GenericImage src={iconRight} width={1.25} />)
            }
            classNames={className}
        />
        :
        <Textarea
            {...props}
            radius={radius || "lg"}
            startContent={
                props.startContent || (iconLeft && <GenericImage src={iconLeft} width={1.25} />)
            }
            endContent={
                props.endContent ||
                (iconRight && <GenericImage src={iconRight} width={1.25} />)
            }
            classNames={className}
        />
}