"use client";

import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalProps } from "@nextui-org/modal";
import SubTitle from "./text/SubTitle";
import React, { JSX } from "react";
import clsx from "clsx";

type Props = {
    title: string
    footerContent?: JSX.Element
} & React.PropsWithChildren & ModalProps

export default function GenericModal({ title, children, footerContent, ...modalProps }: Props) {
    return (
        <Modal
            {...modalProps}
            size={modalProps.size || "2xl"}
            className={clsx(
                modalProps.className,
                "!bg-neutral-950/90 backdrop-blur-md"
            )}
            backdrop="blur"
            placement="center"
        >
            <ModalContent>
                <ModalHeader>
                    <SubTitle className="capitalize" thick>{title}</SubTitle>
                </ModalHeader>
                <ModalBody>
                    <div className=" p-6">
                        {children}
                    </div>
                </ModalBody>
                {
                    footerContent &&
                    <ModalFooter>
                        {footerContent}
                    </ModalFooter>
                }
            </ModalContent>
        </Modal>
    );
}