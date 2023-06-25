"use client";

import { JSX, MouseEventHandler, useState } from "react";

type Props = {
    icon: JSX.Element
    label: string
    action?: () => void
    onHoverEnter?: MouseEventHandler<HTMLDivElement>
    onHoverLeave?: MouseEventHandler<HTMLDivElement>

}

export default function QuickAction({ icon, label, action, onHoverEnter, onHoverLeave }: Props) {
    const [iconContainerColor, setIconContainerColor] = useState("#e5e7eb20")
    const setActiveContainerColour = () => { setIconContainerColor("#00D61520") }
    const setDefaultContainerColour = () => { setIconContainerColor("#e5e7eb20") }

    return (
        <div
            className="w-24 hover:text-primary transition-fast cursor-pointer"
            onClick={action}
            onMouseEnter={(e) => {
                setActiveContainerColour()
                if (onHoverEnter)
                    onHoverEnter(e)
            }}
            onMouseLeave={(e) => {
                setDefaultContainerColour()
                if (onHoverLeave)
                    onHoverLeave(e)
            }}
        >
            <div className="w-12 h-12 mx-auto mb-4 rounded-full p-2 transition-fast flex justify-center items-center"
                style={{
                    backgroundColor: iconContainerColor
                }}
            >
                {icon}
            </div>
            <p className="text-center">{label}</p>
        </div>
    );
}