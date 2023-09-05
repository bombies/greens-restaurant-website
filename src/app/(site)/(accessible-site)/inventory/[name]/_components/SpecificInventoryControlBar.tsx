"use client";

import GenericButton from "../../../../../_components/inputs/GenericButton";
import { errorToast, useUserData } from "../../../../../../utils/Hooks";
import { usePathname, useRouter } from "next/navigation";
import sparklesIcon from "/public/icons/sparkles-green.svg";
import eyeIcon from "/public/icons/green-eye.svg";
import backIcon from "/public/icons/back-green.svg";
import trashIcon from "/public/icons/red-trash.svg";
import { Link } from "@nextui-org/react";
import ConfirmationModal from "../../../../../_components/ConfirmationModal";
import { useState } from "react";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { toast } from "react-hot-toast";

type Props = {
    inventoryName: string,
}

const DeleteInventory = (inventoryName: string) => {
    const mutator = (url: string) => axios.delete(url);
    return useSWRMutation(`/api/inventory/${inventoryName}`, mutator);
};

const customSnapshotRegex = /\/inventory\/[a-zA-Z0-9-]+\/snapshots\/.+/;
const currentSnapshotRegex = /\/inventory\/[a-zA-Z0-9-]+/;
const snapshotPageRegex = /\/inventory\/[a-zA-Z0-9-]+\/snapshots/;
const insightPageRegex = /\/inventory\/[a-zA-Z0-9-]+\/insights/;

export default function SpecificInventoryControlBar({ inventoryName }: Props) {
    const { data, isLoading } = useUserData();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const router = useRouter();
    const pathName = usePathname();
    const { trigger: deleteInventory, isMutating: inventoryIsDeleting } = DeleteInventory(inventoryName);

    return (
        <>
            <ConfirmationModal
                isOpen={deleteModalOpen}
                setOpen={setDeleteModalOpen}
                accepting={inventoryIsDeleting}
                title="Delete Inventory"
                message="Are you sure you want to delete this inventory?"
                onAccept={() => {
                    deleteInventory()
                        .then(() => {
                            toast.success("You have successfully deleted that inventory!");
                        })
                        .catch(e => {
                            errorToast(e, "There was an error deleting this inventory!");
                        });
                }}
            />
            <div
                className="default-container p-12 phone:px-4 grid grid-cols-4 tablet:grid-cols-2 phone:grid-cols-1 gap-4 phone:gap-6">
                <GenericButton
                    fullWidth
                    variant="flat"
                    icon={eyeIcon}
                    onPress={() => {
                        let url: string;
                        if (customSnapshotRegex.test(pathName)) {
                            url = `/inventory/${inventoryName}/snapshots`;
                        } else if (snapshotPageRegex.test(pathName)) {
                            url = `/inventory/${inventoryName}/`;
                        } else if (currentSnapshotRegex.test(pathName)) {
                            url = `/inventory/${inventoryName}/snapshots`;
                        } else url = `/inventory/${inventoryName}/snapshots`;

                        router.push(url);
                    }}>{
                    customSnapshotRegex.test(pathName) ? "View Snapshots" :
                        snapshotPageRegex.test(pathName) ? "Back To Current Stock" :
                            currentSnapshotRegex.test(pathName) ? "View Snapshots" :
                                "View Current Stock"
                }</GenericButton>
                <GenericButton
                    fullWidth
                    variant="flat"
                    icon={sparklesIcon}
                    onPress={() => {
                        let url: string;
                        if (insightPageRegex.test(pathName)) {
                            url = `/inventory/${inventoryName}/`;
                        } else url = `/inventory/${inventoryName}/insights`;

                        router.push(url);
                    }}
                >{insightPageRegex.test(pathName) ? "View Current Stock" : "View Insights"}</GenericButton>
                <GenericButton
                    fullWidth
                    icon={backIcon}
                    variant="flat"
                    href="/inventory"
                    as={Link}
                >All Inventories</GenericButton>
                <GenericButton
                    variant="flat"
                    color="danger"
                    icon={trashIcon}
                    onPress={() => setDeleteModalOpen(true)}
                >Delete Inventory</GenericButton>
            </div>
        </>
    );
}