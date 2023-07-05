"use client";

import AddStockItemButton from "./AddStockItemButton";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import { sendToast, useUserData } from "../../../../../../utils/Hooks";
import { hasAnyPermission, Permission } from "../../../../../../libs/types/permission";
import { useCurrentStock } from "./CurrentStockContext";
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
import checkIcon from "/public/icons/check-green-circled.svg";

type Props = {
    inventoryName: string,
}

const DeleteInventory = (inventoryName: string) => {
    const mutator = (url: string) => axios.delete(url);
    return useSWRMutation(`/api/inventory/${inventoryName}`, mutator);
};

export default function SpecificInventoryControlBar({ inventoryName }: Props) {
    const { data, isLoading } = useUserData();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const router = useRouter();
    const pathName = usePathname();
    const { trigger: deleteInventory, isMutating: inventoryIsDeleting } = DeleteInventory(inventoryName);

    const customSnapshotRegex = /\/inventory\/[a-zA-Z0-9-]+\/snapshots\/.+/;
    const currentSnapshotRegex = /\/inventory\/[a-zA-Z0-9-]+/;
    const snapshotPageRegex = /\/inventory\/[a-zA-Z0-9-]+\/snapshots/;
    const insightPageRegex = /\/inventory\/[a-zA-Z0-9-]+\/insights/;

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
                            sendToast({
                                icon: checkIcon,
                                description: "You have successfully deleted that inventory!"
                            }, {
                                position: "top-center"
                            });
                        })
                        .catch(e => {
                            sendToast({
                                error: e,
                                description: "There was an error deleting this inventory!"
                            }, {
                                position: "top-center"
                            });
                        });
                }}
            />
            <div
                className="default-container p-12 phone:px-4 grid grid-cols-5 tablet:grid-cols-2 phone:grid-cols-1 gap-4 phone:gap-6">
                <AddStockItemButton
                    inventoryName={inventoryName}
                    disabled={!hasAnyPermission(data?.permissions, [Permission.CREATE_INVENTORY, Permission.MUTATE_STOCK])}
                />
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