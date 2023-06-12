"use client";

import trashIcon from "/public/icons/trash.svg";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import React, { useState } from "react";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/modal";
import SubTitle from "../../../../../_components/text/SubTitle";
import { sendToast } from "../../../../../../utils/Hooks";
import { useRouter } from "next/navigation";
import { Spacer } from "@nextui-org/react";
import { useSession } from "next-auth/react";

const DeleteUser = (username: string) => {
    const mutator = async (url: string) => await axios.delete(url);
    return useSWRMutation(`/api/users/${username}`, mutator);
};

type Props = {
    username: string,
    allowed: boolean,
}

export default function DeleteEmployeeButton({ username, allowed }: Props) {
    const session = useSession();
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
    const {
        trigger: triggerUserDelete,
        isMutating: userIsDeleting,
        error: userDeleteError
    } = DeleteUser(username);

    return (
        <>
            <GenericButton
                shadow
                color="danger"
                icon={trashIcon}
                onClick={() => setModalOpen(true)}
                disabled={!allowed}
            >
                Delete Employee
            </GenericButton>
            <Modal
                size="2xl"
                className="bg-neutral-800"
                isOpen={modalOpen && allowed}
                onClose={() => setModalOpen(false)}
                showCloseButton={true}
                backdrop="opaque"
            >
                <ModalContent>
                    <ModalHeader>
                        <SubTitle thick>Delete User</SubTitle>
                    </ModalHeader>
                    <ModalBody>
                        <div className="p-6">
                            <div className="default-container p-6">
                                <p className="font-semibold">Are you sure you want to delete this user?</p>
                                <Spacer y={6} />
                                <div className="flex gap-4">
                                    <GenericButton
                                        shadow
                                        disabled={userIsDeleting}
                                        onClick={() => {
                                            if (!allowed)
                                                return;

                                            if (session.data?.user?.username === username) {
                                                sendToast({
                                                    description: "You cannot delete yourself!"
                                                }, {
                                                    position: "top-center"
                                                });
                                                return;
                                            } else if (username === "root") {
                                                sendToast({
                                                    description: "You cannot delete the root user!"
                                                }, {
                                                    position: "top-center"
                                                });
                                                return;
                                            }

                                            triggerUserDelete()
                                                .then(() => {
                                                    sendToast({
                                                        description: `Successfully deleted ${username}!`
                                                    }, {
                                                        position: "top-center"
                                                    });

                                                    router.push("/employees");
                                                })
                                                .catch((e) => {
                                                    console.error(e);
                                                    sendToast({
                                                        description: "There was an error deleting this user!"
                                                    }, {
                                                        position: "top-center"
                                                    });
                                                });
                                        }
                                        }
                                    >
                                        I&apos;m sure
                                    </GenericButton>
                                    <GenericButton
                                        disabled={userIsDeleting}
                                        color="danger"
                                        bordered
                                        onClick={() => {
                                            setModalOpen(false);
                                        }}
                                    >
                                        Never mind
                                    </GenericButton>
                                </div>
                            </div>

                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}