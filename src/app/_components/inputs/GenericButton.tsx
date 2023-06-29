import React from "react";
import ComponentSize from "../ComponentSize";
import ComponentColor from "../ComponentColor";
import { StaticImageData } from "next/image";
import clsx from "clsx";
import GenericImage from "../GenericImage";
import { Spinner } from "@nextui-org/spinner";
import { Button, ButtonProps } from "@nextui-org/react";

type Props =
    ButtonProps
    & {
    icon?: string | StaticImageData;
}

export default function GenericButton({ icon, children, ...props }: Props) {
    const button =
        <Button
            {...props}
            color={props.color || "primary"}
            variant={props.variant || "shadow"}
            size={props.size || "lg"}
            startContent={icon && <GenericImage src={icon} width={1.35} />}
            className={clsx(
                "z-0 rounded-xl self-center cursor-pointer transition-fast hover:-translate-y-[.25rem] disabled:opacity-50 disabled:cursor-not-allowed p-6"
            )}
        >
            {children}
        </Button>;

    return (button);
}