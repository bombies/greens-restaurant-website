"use client";

import { StaticImageData } from "next/image";
import GenericImage from "../GenericImage";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { Input, InputProps } from "@nextui-org/input";
import clsx from "clsx";
import { useState } from "react";
import lockIcon from "/public/icons/lock.svg";
import unlockIcon from "/public/icons/unlocked.svg";

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

    const input = register ?
        <Input
            {...register(id, { required: props.required })}
            {...props}
            type={type === "password" ? (passwordVisible ? "text" : "password") : type}
            radius={radius || "xl"}
            startContent={
                iconLeft && <GenericImage src={iconLeft} width={1.25} />
            }
            endContent={
                type === "password" ?
                    <GenericImage
                        src={passwordVisible ? lockIcon : unlockIcon}
                        onClick={togglePasswordVisibility}
                        width={1.25}
                    />
                    :
                    iconRight && <GenericImage src={iconRight} width={1.25} />
            }
            classNames={{
                inputWrapper: clsx(
                    "transition-fast ring-2 ring-neutral-800 hover:ring-primary hover:-translate-y-[0.15rem]"
                )
            }}
        />
        :
        <Input
            {...props}
            type={type === "password" ? (passwordVisible ? "text" : "password") : type}
            radius={radius || "xl"}
            startContent={
                iconLeft && <GenericImage src={iconLeft} width={1.25} />
            }
            endContent={
                type === "password" ?
                    <GenericImage
                        src={passwordVisible ? lockIcon : unlockIcon}
                        onClick={togglePasswordVisibility}
                        width={1.25}
                    />
                    :
                    iconRight && <GenericImage src={iconRight} width={1.25} />
            }
            classNames={{
                inputWrapper: clsx(
                    "transition-fast ring-2 ring-neutral-800 hover:ring-primary hover:-translate-y-[0.15rem]"
                )
            }}
        />;

    return (
        <>{input}</>
    );
}