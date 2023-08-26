"use client";

import { FC, useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "../../../../employees/_components/EmployeeGrid";
import { StockRequestWithOptionalExtras } from "../../../_components/requests/inventory-requests-utils";
import Title from "../../../../../../_components/text/Title";
import { Spacer } from "@nextui-org/react";
import { GoBackButton } from "../../../../invoices/[id]/components/control-bar/InvoiceCustomerControlBar";
import { useRouter } from "next/navigation";
import { useUserData } from "../../../../../../../utils/Hooks";
import Permission, { hasAnyPermission } from "../../../../../../../libs/types/permission";
import InventoryRequestedItemsTable from "../../../_components/requests/user/form/InventoryRequestedItemsTable";
import { toast } from "react-hot-toast";
import "../../../../../../../utils/GeneralUtils";
import ChangesMadeBar from "../../../../employees/[username]/_components/ChangesMadeBar";
import CheckIcon from "../../../../../../_components/icons/CheckIcon";
import { StockRequestStatus } from ".prisma/client";
import SpecificInventoryRequestInformation from "./SpecificInventoryRequestInformation";
import ConfirmInventoryRequestReviewModal from "./ConfirmInventoryRequestReviewModal";
import useAdminInventoryRequestData, { OptimisticRequestDataActionType } from "./hooks/useAdminInventoryRequestData";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { UpdateRequestedStockItemDto } from "../../../../../../api/inventory/requests/me/[id]/[itemId]/route";
import { InventorySnapshotWithInventoryAndStockSnapshots } from "../../../../../../api/inventory/[name]/utils";
import { RequestedStockItem } from "@prisma/client";
import "../../../../../../../utils/GeneralUtils";

type Props = {
    id: string,
}

const FetchRequest = (id: string) => {
    return useSWR(`/api/inventory/requests/${id}?with_items=true&with_users=true&with_assignees=true`, fetcher<StockRequestWithOptionalExtras>);
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

const FetchCurrentSnapshots = (ids: string[]) => {
    return useSWR(`/api/inventory/currentsnapshots?ids=${ids.toString()}`, fetcher<InventorySnapshotWithInventoryAndStockSnapshots[]>);
};

const SpecificRequestContainer: FC<Props> = ({ id }) => {
    const { data: userData } = useUserData([
        Permission.CREATE_INVENTORY,
        Permission.CREATE_STOCK_REQUEST,
        Permission.VIEW_STOCK_REQUESTS,
        Permission.MANAGE_STOCK_REQUESTS
    ]);
    const { data: request, isLoading: requestIsLoading, mutate } = FetchRequest(id);
    const { trigger: updateItem, isMutating: itemIsUpdating } = UpdateItem(id);
    const { trigger: deleteItem, isMutating: itemIsDeleting } = DeleteItem(id);
    const [changesMade, setChangesMade] = useState(false);
    const { optimisticRequest, dispatchOptimisticRequest, startingRequest } = useAdminInventoryRequestData({
        isEnabled: hasAnyPermission(userData?.permissions, [Permission.CREATE_INVENTORY, Permission.MANAGE_STOCK_REQUESTS]),
        request,
        requestIsLoading,
        changesMade,
        setChangesMade
    });
    const [confirmReviewModalOpen, setConfirmReviewModalOpen] = useState(false);
    const router = useRouter();


    useEffect(() => {
        if ((!requestIsLoading && !request)
            || (!requestIsLoading && request && userData && !hasAnyPermission(userData.permissions, [
                Permission.CREATE_INVENTORY,
                Permission.VIEW_STOCK_REQUESTS,
                Permission.MANAGE_STOCK_REQUESTS
            ]) && request.requestedByUser?.id !== userData.id)
        )
            router.push("/inventory/requests");
    }, [request, requestIsLoading, router, userData]);

    return (
        <div>
            <ConfirmInventoryRequestReviewModal
                isOpen={confirmReviewModalOpen}
                setOpen={setConfirmReviewModalOpen}
                id={id}
                mutate={mutate}
                optimisticRequest={optimisticRequest}
            />
            <ChangesMadeBar
                changesMade={changesMade}
                isChanging={false}
                onAccept={() => {
                    setConfirmReviewModalOpen(true);
                }}
                onReject={() => {
                    dispatchOptimisticRequest({
                        type: OptimisticRequestDataActionType.SET,
                        payload: { ...startingRequest }
                    });
                }}
                label="You have started reviewing this inventory request!"
                saveButtonConfig={{
                    icon: <CheckIcon />,
                    label: "Finish Review"
                }}
                rejectButtonConfig={{
                    label: "Cancel Review"
                }}
            />
            <Title>Inventory Request</Title>
            <SpecificInventoryRequestInformation
                request={request}
                requestIsLoading={requestIsLoading}
            />
            <Spacer y={12} />
            <div className="default-container max-w-[80%] tablet:w-full p-12 phone:px-4">
                <GoBackButton label="View All Requests" href="/inventory/requests" />
                <Spacer y={6} />
                <InventoryRequestedItemsTable
                    items={optimisticRequest.items.length ? optimisticRequest.items : (request?.requestedItems || [])}
                    showItemStatus
                    isLoading={requestIsLoading}
                    adminActions={request?.status === StockRequestStatus.PENDING && hasAnyPermission(userData?.permissions, [Permission.MANAGE_STOCK_REQUESTS, Permission.CREATE_INVENTORY])}
                    onAdminAction={{
                        onApprove(item) {
                            if (!item.id)
                                return;

                            // TODO: Make checks with the current snapshot to ensure item can be approved

                            dispatchOptimisticRequest({
                                type: OptimisticRequestDataActionType.APPROVE,
                                payload: { id: item.id }
                            });

                            toast.success(`Successfully approved ${item?.stock?.name.replaceAll("-", " ").capitalize()}`);
                        },
                        onPartialApprove(item, amountApproved) {
                            if (!item.id)
                                return;

                            // TODO: Make checks with the current snapshot to ensure item can be partially approved with the amount

                            dispatchOptimisticRequest({
                                type: OptimisticRequestDataActionType.PARTIALLY_APPROVE,
                                payload: { id: item.id, amountApproved: amountApproved }
                            });

                            toast.success(`Successfully partially approved ${item?.stock?.name.replaceAll("-", " ").capitalize()}`);
                        },
                        onReject(item) {
                            if (!item.id)
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
                />
            </div>
        </div>
    );
};

export default SpecificRequestContainer;