"use client";

import GenericModal from "./GenericModal";
import React, { Dispatch, SetStateAction } from "react";
import GenericButton from "./inputs/GenericButton";
import { Spacer } from "@nextui-org/react";

type Props = {
    isOpen: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>,
    title: string,
    message: string,
    accepting?: boolean,
    onAccept: () => void,
}

export default function ConfirmationModal({ isOpen, setOpen, title, message, onAccept, accepting }: Props) {
    return (
        <GenericModal
            classNames={{
                wrapper: "z-[202]",
                backdrop: "z-[201]"
            }}
            title={title}
            isOpen={isOpen}
            onClose={() => setOpen(false)}
        >
            <p className="font-semibold">{message}</p>
            <Spacer y={6} />
            <div className="flex gap-4">
                <GenericButton
                    disabled={accepting}
                    onPress={() => {
                        onAccept();
                    }}
                    isLoading={accepting}
                >
                    I&apos;m sure
                </GenericButton>
                <GenericButton
                    disabled={accepting}
                    color="danger"
                    variant="flat"
                    onPress={() => {
                        setOpen(false);
                    }}
                >
                    Never mind
                </GenericButton>
            </div>
        </GenericModal>
    );
}