"use client";

import trashIcon from "/public/icons/trash.svg";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import React, { useState } from "react";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { sendToast } from "../../../../../../utils/Hooks";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ConfirmationModal from "../../../../../_components/ConfirmationModal";

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
        isMutating: userIsDeleting
    } = DeleteUser(username);

    return (
        <>
            <GenericButton
                color="danger"
                icon={trashIcon}
                onPress={() => setModalOpen(true)}
                disabled={!allowed}
            >
                Delete Employee
            </GenericButton>
            <ConfirmationModal
                isOpen={modalOpen}
                setOpen={setModalOpen}
                title="Delete User"
                message="Are you sure you want to delete this user?"
                onAccept={() => {
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
                }}
                accepting={userIsDeleting}
            />
        </>
    );
}