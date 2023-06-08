"use client";

import { DetailedHTMLProps, InputHTMLAttributes, useState } from "react";
import clsx from "clsx";
import ComponentSize from "../ComponentSize";
import lock from "/public/icons/lock.svg";
import unlocked from "/public/icons/unlocked.svg";
import { StaticImageData } from "next/image";
import GenericImage from "../GenericImage";
import { FieldValues, UseFormRegister } from "react-hook-form";

type Props = Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "size"> & {
    id: string;
    label: string;
    width?: number;
    iconLeft?: string | StaticImageData;
    iconRight?: string | StaticImageData;
    required?: boolean;
    register: UseFormRegister<FieldValues>;
    size?: ComponentSize;
}

export default function GenericInput({
                                         id, label, size, width, iconLeft, iconRight, required, register, ...props
                                     }: Props) {
    const [passwordVisible, setPasswordVisible] = useState(false);

    let parsedSize: string;
    switch (size) {
        case "xs": {
            parsedSize = "py-2";
            break;
        }
        case "sm": {
            parsedSize = "py-3";
            break;
        }
        case "md": {
            parsedSize = "py-4";
            break;
        }
        case "lg": {
            parsedSize = "py-5";
            break;
        }
        case "xl": {
            parsedSize = "py-6";
            break;
        }
        default: {
            parsedSize = "py-4";
            break;
        }
    }

    return (
        <label>
                <span className="block">
                    <p className="mb-2">{label}</p>
                </span>
            <div className="relative placeholder:none">
                {
                    iconLeft &&
                    <span className="z-10 absolute inset-y-0 left-0 flex items-center pl-3">
                            <GenericImage src={iconLeft} width={1.25} />
                        </span>
                }
                <input
                    {...register(id, { required })}
                    {...props}
                    className={clsx(`
                    outline-none
                    rounded-xl
                    ring-2
                    ring-neutral-800
                    placeholder-neutral-500
                    focus:ring-primary
                    focus:-translate-y-[0.15rem]
                    focus:placeholder:opacity-0
                    transition-fast
                    bg-neutral-900
                    disabled:opacity-50
                    disabled:cursor-not-allowed`,
                        parsedSize,
                        iconLeft ? "pl-10" : "pl-4",
                        iconRight || props.type === "password" ? "pr-10" : "pr-4"
                    )}
                    style={{
                        width: width ? `${width}rem` : "100%"
                    }}
                    id={id}
                    autoComplete={id}
                    placeholder={props.placeholder}
                    type={props.type === "password" ? (passwordVisible ? "text" : "password") : props.type}
                />
                {
                    props.type === "password" ?
                        <span className="z-10 absolute inset-y-0 right-0 flex items-center pr-3"
                              onClick={() => setPasswordVisible(prev => !prev)}>
                                <GenericImage src={passwordVisible ? lock : unlocked} width={1.25}
                                              onClick={() => setPasswordVisible(prev => !prev)} />
                            </span> :
                        iconRight &&
                        <span className="z-10 absolute inset-y-0 right-0 flex items-center pr-3">
                            <GenericImage src={iconRight} width={1.25} />
                        </span>
                }
            </div>
        </label>
    );
}