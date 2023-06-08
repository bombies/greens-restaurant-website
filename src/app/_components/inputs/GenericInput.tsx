"use client";

import { DetailedHTMLProps, InputHTMLAttributes, useState } from "react";
import clsx from "clsx";
import ComponentSize from "../ComponentSize";
import lock from '/public/icons/lock.svg';
import unlocked from '/public/icons/unlocked.svg';
import { StaticImageData } from "next/image";
import GenericImage from "../GenericImage";
import { FieldValues, UseFormRegister } from "react-hook-form";

interface Props extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    label: string;
    size?: ComponentSize;
    width?: number;
    iconLeft?: string | StaticImageData;
    iconRight?: string | StaticImageData;
    required?: boolean;
    register: UseFormRegister<FieldValues>;
}

export default function GenericInput(props: Props) {
    const [passwordVisible, setPasswordVisible] = useState(false);

    let size: string;
    switch (props.size) {
        case "xs": {
            size = "py-2";
            break;
        }
        case "sm": {
            size = "py-3";
            break;
        }
        case "md": {
            size = "py-4";
            break;
        }
        case "lg": {
            size = "py-5";
            break;
        }
        case "xl": {
            size = "py-6";
            break;
        }
        default: {
            size = "py-4";
            break;
        }
    }

    return (
        <label>
                <span className="block">
                    <p className='mb-2'>{props.label}</p>
                </span>
            <div className="relative placeholder:none">
                {
                    props.iconLeft &&
                    <span className="z-10 absolute inset-y-0 left-0 flex items-center pl-3">
                            <GenericImage src={props.iconLeft} width={1.25} />
                        </span>
                }
                <input
                    {...props.register(props.id, { required: props.required })}
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
                        size,
                        props.iconLeft ? 'pl-10' : 'pl-4',
                        props.iconRight || props.type === 'password' ? 'pr-10' : 'pr-4'
                    )}
                    style={{
                        width: props.width ? `${props.width}rem` : "100%"
                    }}
                    id={props.id}
                    autoComplete={props.id}
                    placeholder={props.placeholder}
                    type={props.type === "password" ? (passwordVisible ? "text" : "password") : props.type}
                />
                {
                    props.type === "password" ?
                        <span className="z-10 absolute inset-y-0 right-0 flex items-center pr-3" onClick={() => setPasswordVisible(prev => !prev)}>
                                <GenericImage src={passwordVisible ? lock : unlocked} width={1.25} onClick={() => setPasswordVisible(prev => !prev)} />
                            </span> :
                        props.iconRight &&
                        <span className="z-10 absolute inset-y-0 right-0 flex items-center pr-3">
                            <GenericImage src={props.iconRight} width={1.25} />
                        </span>
                }
            </div>
        </label>
    );
}