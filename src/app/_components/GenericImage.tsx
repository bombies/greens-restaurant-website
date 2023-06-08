'use client';

import Image, {StaticImageData} from "next/image";
import {CSSProperties, MouseEventHandler, useRef} from "react";
import { useVisible } from "../../utils/Hooks";

type Props = {
    className?: string
    imageClassName?: string
    src: string | StaticImageData,
    alt?: string,
    width?: number,
    height?: number,
    priority?: boolean,
    fade?: boolean,
    draggable?: boolean,
    style?: CSSProperties,
    onClick?: MouseEventHandler<HTMLDivElement>
}

export default function GenericImage(props: Props) {
    const ref = useRef<any>();
    const isVisible = useVisible(ref);

    return (
        <div
            ref={ref}
            className={`relative ${props.fade !== undefined ? `fade-in-section ${isVisible ? 'is-visible' : ''}` : ''} ${props.className || ''} ${props.onClick ? 'cursor-pointer' : ''}`}
            onClick={props.onClick}
            style={{
                width: props.width && `${props.width}rem`,
                height: props.width && `${props.height ?? props.width}rem`,
            }}
        >
            <Image
                onClick={props.onClick}
                className={props.imageClassName}
                priority={props.priority !== undefined}
                draggable={props.draggable !== undefined}
                src={props.src}
                alt={props.alt ?? ''}
                fill={true}
                style={{
                    objectFit: 'contain',
                    ...props.style
                }}
                sizes={props.width ? `${props.width}rem` : undefined}
            />
        </div>
    )
}