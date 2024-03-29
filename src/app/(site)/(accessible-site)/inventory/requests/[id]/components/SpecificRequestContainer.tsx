"use client";

import { FC, useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import Title from "../../../../../../_components/text/Title";
import { Spacer } from "@nextui-org/react";
import { GoBackButton } from "../../../../invoices/[id]/components/control-bar/InvoiceCustomerControlBar";
import { useRouter } from "next/navigation";
import InventoryRequestedItemsTable from "../../../_components/requests/user/form/InventoryRequestedItemsTable";
import { toast } from "react-hot-toast";
import "../../../../../../../utils/GeneralUtils";
import { StockRequestStatus } from ".prisma/client";
import SpecificInventoryRequestInformation from "./SpecificInventoryRequestInformation";
import ConfirmInventoryRequestReviewModal from "./ConfirmInventoryRequestReviewModal";
import useAdminInventoryRequestData, { OptimisticRequestDataActionType } from "./hooks/useAdminInventoryRequestData";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { UpdateRequestedStockItemDto } from "../../../../../../api/inventory/requests/me/[id]/[itemId]/route";
import { RequestedStockItem } from "@prisma/client";
import "../../../../../../../utils/GeneralUtils";
import useCurrentInventoryRequestSnapshots from "./hooks/useCurrentInventoryRequestSnapshots";
import { AnimatePresence, motion } from "framer-motion";
import ChangesMadeContainer from "../../../../../../_components/ChangesMadeContainer";
import { useSession } from "next-auth/react";
import { StockRequestWithOptionalExtras } from "@/app/api/inventory/requests/types";

type Props = {
    id: string,
    isAdmin: boolean,
}

const FetchRequest = (id: string) => {
    return useSWR(`/api/inventory/requests/${id}?with_items=true&with_users=true&with_assignees=true&with_reviewer=true`, fetcher<StockRequestWithOptionalExtras>);
};

type UpdateItemArgs = {
    arg: {
        itemId: string,
        dto: UpdateRequestedStockItemDto
    }
}

const UpdateItem = (id: string) => {
    const mutator = (url: string, { arg }: UpdateItemArgs) => axios.patch(url.replace("{item_id}", arg.itemId), arg.dto);
    return useSWRMutation(`/api/inventory/requests/me/${id}/{item_id}`, mutator);
};

type DeleteItemArgs = {
    arg: {
        itemId: string
    }
}

const DeleteItem = (id: string) => {
    const mutator = (url: string, { arg }: DeleteItemArgs) => axios.delete(url.replace("{item_id}", arg.itemId));
    return useSWRMutation(`/api/inventory/requests/me/${id}/{item_id}`, mutator);
};

const SpecificRequestContainer: FC<Props> = ({ id, isAdmin }) => {
    const { data: session } = useSession()
    const { data: request, isLoading: requestIsLoading, mutate } = FetchRequest(id);
    const { trigger: updateItem, isMutating: itemIsUpdating } = UpdateItem(id);
    const { trigger: deleteItem, isMutating: itemIsDeleting } = DeleteItem(id);
    const [changesMade, setChangesMade] = useState(false);
    const { optimisticRequest, dispatchOptimisticRequest, resetOptimisticData } = useAdminInventoryRequestData({
        isEnabled: isAdmin,
        request,
        requestIsLoading,
        setChangesMade
    });
    const [confirmReviewModalOpen, setConfirmReviewModalOpen] = useState(false);
    const router = useRouter();
    const { snapshots, isLoadingSnapshots } = useCurrentInventoryRequestSnapshots({
        isAdmin: isAdmin,
        request,
        requestIsLoading
    });

    useEffect(() => {
        if (!requestIsLoading && !request)
            router.replace("/inventory/requests");
    }, [request, requestIsLoading, router]);


    return (
        <div>
            <ConfirmInventoryRequestReviewModal
                isOpen={confirmReviewModalOpen}
                setOpen={setConfirmReviewModalOpen}
                id={id}
                onReview={resetOptimisticData}
                mutate={mutate}
                optimisticRequest={optimisticRequest}
            />
            <Title>Inventory Request</Title>
            <SpecificInventoryRequestInformation
                request={request}
                requestIsLoading={requestIsLoading}
            />
            <Spacer y={12} />
            <div className="default-container max-w-full p-12 phone:px-4">
                <GoBackButton label="View All Requests" href="/inventory/requests/all" />
                <Spacer y={6} />
                <InventoryRequestedItemsTable
                    stickyHeader
                    items={optimisticRequest.items.length && !isLoadingSnapshots ? optimisticRequest.items : (request?.requestedItems || [])}
                    inventorySnapshots={snapshots}
                    showItemStatus
                    requestStatus={request?.status}
                    isLoading={requestIsLoading || isLoadingSnapshots}
                    adminActions={request?.status === StockRequestStatus.PENDING && isAdmin}
                    onAdminAction={{
                        onApprove(item) {
                            if (!item.id || item.amountRequested === item.amountProvided)
                                return;

                            dispatchOptimisticRequest({
                                type: OptimisticRequestDataActionType.APPROVE,
                                payload: { id: item.id }
                            });

                            toast.success(`Successfully approved ${item?.stock?.name.replaceAll("-", " ").capitalize()}`);
                        },
                        onExtraApprove(item, amountApproved) {
                            if (!item.id)
                                return;

                            dispatchOptimisticRequest({
                                type: OptimisticRequestDataActionType.PARTIALLY_APPROVE,
                                payload: { id: item.id, amountApproved: amountApproved }
                            });

                            toast.success(`Successfully extra approved ${item?.stock?.name.replaceAll("-", " ").capitalize()}`);

                        },
                        onPartialApprove(item, amountApproved) {
                            if (!item.id)
                                return;

                            dispatchOptimisticRequest({
                                type: OptimisticRequestDataActionType.PARTIALLY_APPROVE,
                                payload: { id: item.id, amountApproved: amountApproved }
                            });

                            toast.success(`Successfully partially approved ${item?.stock?.name.replaceAll("-", " ").capitalize()}`);
                        },
                        onReject(item) {
                            if (!item.id || item.amountProvided === 0)
                                return;

                            dispatchOptimisticRequest({
                                type: OptimisticRequestDataActionType.REJECT,
                                payload: { id: item.id }
                            });

                            toast.success(`Successfully rejected ${item?.stock?.name.replaceAll("-", " ").capitalize()}`);
                        }

                    }}
                    onSelfAction={request?.status === StockRequestStatus.PENDING ? {
                        onRemove: {
                            removing: itemIsDeleting,
                            async action(item) {
                                const remove = async () => {
                                    return deleteItem({
                                        itemId: item.id!
                                    })
                                        .then(res => {
                                            const deletedItem: RequestedStockItem = res.data;
                                            const updatedInfo = { ...request };
                                            const deletedIndex = request?.requestedItems?.findIndex(reqItem => reqItem.id === deletedItem.id);

                                            if (deletedIndex === -1 || deletedIndex === undefined)
                                                return;
                                            updatedInfo?.requestedItems?.splice(deletedIndex);
                                            mutate(updatedInfo);
                                        })
                                        .catch(e => {
                                            console.error(e);
                                            throw e;
                                        });
                                };

                                await toast.promise(remove(), {
                                    loading: `Removing ${item.stock?.name.replaceAll("-", " ").capitalize()}...`,
                                    success: `Successfully removed ${item.stock?.name.replaceAll("-", " ").capitalize()}!`,
                                    error(msg?: string) {
                                        return msg ?? `There was an error removing ${item.stock?.name.replaceAll("-", " ").capitalize()}!`;
                                    }
                                });
                            }
                        },
                        onAmountChange: {
                            editing: itemIsUpdating,
                            async action(item, newAmount) {
                                const remove = async () => {
                                    return updateItem({
                                        itemId: item.id!,
                                        dto: {
                                            amountRequested: newAmount
                                        }
                                    })
                                        .then(res => {
                                            const updatedItem: RequestedStockItem = res.data;
                                            const updatedInfo = { ...request };
                                            const updatedIndex = request?.requestedItems?.findIndex(reqItem => reqItem.id === updatedItem.id);

                                            if (updatedIndex === -1 || updatedIndex === undefined)
                                                return;

                                            const currentItem = updatedInfo.requestedItems![updatedIndex];
                                            updatedInfo.requestedItems![updatedIndex] = {
                                                ...currentItem,
                                                amountRequested: updatedItem.amountRequested
                                            };
                                            mutate(updatedInfo);
                                        })
                                        .catch(e => {
                                            console.error(e);
                                            throw e;
                                        });
                                };

                                await toast.promise(remove(), {
                                    loading: `Updating ${item.stock?.name.replaceAll("-", " ").capitalize()}...`,
                                    success: `Successfully updated ${item.stock?.name.replaceAll("-", " ").capitalize()}!`,
                                    error(msg?: string) {
                                        return msg ?? `There was an error updating ${item.stock?.name.replaceAll("-", " ").capitalize()}!`;
                                    }
                                });
                            }
                        }
                    } : undefined}
                    editAllowed={session?.user?.id === request?.requestedByUser?.id}
                />
                <Spacer y={6} />
                <AnimatePresence>
                    {changesMade && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="flex justify-between gap-12 w-full tablet:gap-4 default-container p-6"
                        >
                            <ChangesMadeContainer
                                changesMade={changesMade}
                                isChanging={false}
                                onAccept={() => {
                                    const pendingItem = optimisticRequest.items.find(item => item.amountProvided === -1 || item.amountProvided === null || item.amountProvided === undefined);
                                    if (pendingItem)
                                        toast.error("You must review all items before finishing your review!");
                                    else
                                        setConfirmReviewModalOpen(true);
                                }}
                                onReject={() => {
                                    resetOptimisticData();
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SpecificRequestContainer;