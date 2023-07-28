"use client";

import React, { useRef } from "react";
import { CSSTransition } from "react-transition-group";
import clsx from "clsx";

type Props = {
    visible: boolean,
    className?: string,
} & React.PropsWithChildren

export default function SlidingBar({ visible, children, className }: Props) {
    const nodeRef = useRef(null);

    return (
        <div className="fixed flex z-[200] pointer-events-none justify-center top-0 left-0 w-full h-full">
            <CSSTransition
                nodeRef={nodeRef}
                in={visible}
                timeout={500}
                classNames="changes-made"
                unmountOnExit
            >
                <div
                    ref={nodeRef}
                    className={clsx(
                        "flex gap-12 w-5/6 tablet:gap-4 absolute pointer-events-auto bottom-5 default-container p-12 backdrop-blur-md",
                        className
                    )}
                >
                    {children}
                </div>
            </CSSTransition>
        </div>
    );
}