import { Tooltip } from "@nextui-org/react";
import ComponentColor from "../ComponentColor";
import { StaticImageData } from "next/image";
import GenericImage from "../GenericImage";
import React from "react";

type Props = {
    toolTip: string,
    icon: string | StaticImageData;
    color?: ComponentColor,
    width?: number
}

export default function IconButton({ toolTip, icon, color, width }: Props) {
    return (
        <Tooltip
            content={toolTip}
            color={color}
            closeDelay={100}
        >
            <button>
                <GenericImage className="self-center" src={icon} width={width || 1.35} />
            </button>
        </Tooltip>
    );
}