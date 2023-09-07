"use client";

import GenericButton from "../../../../../_components/inputs/GenericButton";
import React, { useState } from "react";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { errorToast } from "../../../../../../utils/Hooks";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ConfirmationModal from "../../../../../_components/ConfirmationModal";
import { toast } from "react-hot-toast";
import TrashIcon from "../../../../../_components/icons/TrashIcon";

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
                startContent={<TrashIcon />}
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
                        toast.error("You cannot delete yourself!");
                        return;
                    } else if (username === "root") {
                        toast.error("You cannot delete the root user!");
                        return;
                    }

                    triggerUserDelete()
                        .then(() => {
                            toast.success(`Successfully deleted ${username}!`);
                            router.push("/employees");
                        })
                        .catch((e) => {
                            console.error(e);
                            errorToast(e, "There was an error deleting this user!");
                        });
                }}
                accepting={userIsDeleting}
            />
        </>
    );
}