"use client";

import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalProps } from "@nextui-org/modal";
import SubTitle from "./text/SubTitle";
import React, { JSX } from "react";
import clsx from "clsx";

type Props = {
    title: string
    footerContent?: JSX.Element,
    bodyClassName?: string,
} & React.PropsWithChildren & ModalProps

export default function GenericModal({ title, children, footerContent, bodyClassName, ...modalProps }: Props) {
    return (
        <Modal
            {...modalProps}
            size={modalProps.size || "2xl"}
            className={clsx(
                modalProps.className,
                "!bg-neutral-950/90 backdrop-blur-md"
            )}
            backdrop={modalProps.backdrop || "opaque"}
            placement={modalProps.placement || "center"}
            scrollBehavior={modalProps.scrollBehavior || "inside"}
            classNames={{
                ...modalProps.classNames,
                backdrop: clsx("bg-neutral-950/90", modalProps.classNames?.backdrop),
            }}
        >
            <ModalContent>
                <ModalHeader>
                    <SubTitle className="capitalize" thick>{title}</SubTitle>
                </ModalHeader>
                <ModalBody>
                    <div className={clsx("p-6", bodyClassName)}>
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