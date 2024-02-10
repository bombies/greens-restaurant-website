"use client";

import React from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
    visible: boolean,
    className?: string,
} & React.PropsWithChildren

export default function SlidingBar({ visible, children, className }: Props) {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    exit={{ y: 100 }}
                    className={clsx(
                        "flex gap-12 w-5/6 tablet:gap-4 absolute pointer-events-auto bottom-5 default-container p-2 backdrop-blur-md",
                        className
                    )}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}