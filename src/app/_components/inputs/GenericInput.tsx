"use client";

import { StaticImageData } from "next/image";
import GenericImage from "../GenericImage";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { Input, InputProps } from "@nextui-org/input";
import clsx from "clsx";
import { useState } from "react";
import lockIcon from "/public/icons/lock.svg";
import unlockIcon from "/public/icons/unlocked.svg";
import { SlotsToClasses } from "@nextui-org/react";

interface Props extends InputProps {
    id: string;
    register?: UseFormRegister<FieldValues>;
    errors?: FieldErrors,
    iconLeft?: string | StaticImageData;
    iconRight?: string | StaticImageData;
}

export default function GenericInput({ id, register, errors, iconLeft, iconRight, radius, type, ...props }: Props) {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const togglePasswordVisibility = () => setPasswordVisible(prev => !prev);

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

    const input = register ?
        <Input
            {...register(id, { required: props.required })}
            {...props}
            type={type === "password" ? (passwordVisible ? "text" : "password") : type}
            radius={radius || "lg"}
            startContent={
                props.startContent || (iconLeft && <GenericImage src={iconLeft} width={1.25} />)
            }
            endContent={
                props.endContent ||
                (type === "password" ?
                    <GenericImage
                        src={passwordVisible ? lockIcon : unlockIcon}
                        onClick={togglePasswordVisibility}
                        width={1.25}
                    />
                    :
                    iconRight && <GenericImage src={iconRight} width={1.25} />)
            }
            classNames={className}
        />
        :
        <Input
            {...props}
            type={type === "password" ? (passwordVisible ? "text" : "password") : type}
            radius={radius || "lg"}
            startContent={
                props.startContent || (iconLeft && <GenericImage src={iconLeft} width={1.25} />)
            }
            endContent={
                props.endContent ||
                (type === "password" ?
                    <GenericImage
                        src={passwordVisible ? lockIcon : unlockIcon}
                        onClick={togglePasswordVisibility}
                        width={1.25}
                    />
                    :
                    iconRight && <GenericImage src={iconRight} width={1.25} />)
            }
            classNames={className}
        />;

    return input
}