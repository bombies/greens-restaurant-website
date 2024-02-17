"use client";

import { StaticImageData } from "next/image";
import GenericImage from "../GenericImage";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input, InputProps } from "@nextui-org/input";
import clsx from "clsx";
import { useMemo, useState } from "react";
import lockIcon from "/public/icons/lock.svg";
import unlockIcon from "/public/icons/unlocked.svg";

interface Props extends InputProps {
    id: string;
    register?: UseFormRegister<any>;
    errors?: FieldErrors,
    iconLeft?: string | StaticImageData;
    iconRight?: string | StaticImageData;
}

export default function GenericInput({ id, register, errors, iconLeft, iconRight, radius, type, ...props }: Props) {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const togglePasswordVisibility = () => setPasswordVisible(prev => !prev);

    const defaultProps = useMemo<InputProps>(() => ({
        ...props,
        classNames: {
            inputWrapper: clsx(
                "transition-fast ring-2 !default-container !h-fit ring-neutral-800 py-6 hover:ring-primary hover:-translate-y-[0.15rem]",
                "group-data-[focused=true]:ring-primary",
                errors && (errors[id] && "ring-danger"),
                props.classNames?.inputWrapper
            ),
            input: props.classNames?.input || "placeholder:text-neutral-600",
            label: props.classNames?.label || "text-neutral-100 text-sm mb-4 font-semibold",
        },
        type: type === "password" ? (passwordVisible ? "text" : "password") : type,
        radius: radius || "lg",
        startContent: props.startContent || (iconLeft && <GenericImage src={iconLeft} width={1.25} />),
        endContent: props.endContent ||
            (type === "password" ?
                <GenericImage
                    src={passwordVisible ? lockIcon : unlockIcon}
                    onClick={togglePasswordVisibility}
                    width={1.25}
                />
                :
                iconRight && <GenericImage src={iconRight} width={1.25} />),
        isInvalid: errors !== undefined && errors[id] != undefined
    }), [errors, iconLeft, iconRight, id, passwordVisible, props, radius, type])

    return register ?
        <Input
            {...register(id, { required: props.required || props.isRequired })}
            {...defaultProps}
        />
        :
        <Input {...defaultProps} />;
}