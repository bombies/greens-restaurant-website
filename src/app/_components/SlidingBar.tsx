"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@nextui-org/react";

type Props = {
    visible: boolean,
    className?: string,
} & React.PropsWithChildren

export default function SlidingBar({ visible, children, className }: Props) {
    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-end items-center py-2 z-50">
            <AnimatePresence>
                {visible && (
                    <motion.div
                        initial={{ y: 200 }}
                        animate={{ y: 0 }}
                        exit={{ y: 200 }}
                        className={cn(
                            "flex gap-12 w-3/4 tablet:w-5/6 phone:w-[90%] h-fit tablet:gap-4 pointer-events-auto default-container p-2 px-12 tablet:px-6 phone:px-3 backdrop-blur-md",
                            className
                        )}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

    );
}