"use client";

import { Dispatch, FC, Fragment, SetStateAction, useEffect, useMemo, useReducer, useState } from "react";
import useSWR from "swr";
import { fetcher } from "../../../../../employees/_components/EmployeeGrid";
import { InventorySnapshotWithInventoryAndStockSnapshots } from "../../../../../../../api/inventory/[name]/utils";
import InventoryRequestedItemsTable from "./InventoryRequestedItemsTable";
import AddRequestedItemsButton from "./AddRequestedItemsButton";
import { CreateStockRequestDto } from "../../../../../../../api/inventory/requests/me/route";
import { RequestedStockItem } from "@prisma/client";
import { RequestedStockItemWithOptionalSnapshot } from "../../inventory-requests-utils";
import { v4 } from "uuid";
import { Divider } from "@nextui-org/divider";
import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import { useRequestCreationTrigger } from "../TriggerRequestCreationProvider";
import { toast } from "react-hot-toast";
import { errorToast } from "../../../../../../../../utils/Hooks";

interface Props {
    selectedIds: string[];
    setSnapshotsLoading: Dispatch<SetStateAction<boolean>>;
    setModalOpen: Dispatch<SetStateAction<boolean>>;
}

const FetchCurrentSnapshots = (ids: string[]) => {
    return useSWR(`/api/inventory/currentsnapshots?ids=${ids.toString()}`, fetcher<InventorySnapshotWithInventoryAndStockSnapshots[]>);
};

export enum ProposedStockRequestsAction {
    ADD_ASSIGNEE,
    REMOVE_ASSIGNEE,
    ADD_ITEM,
    REMOVE_ITEM,
    UPDATE_ITEM,
}

const reducer = (state: CreateStockRequestDto, { type, payload }: {
    type: ProposedStockRequestsAction,
    payload: { id: string }
        | Pick<RequestedStockItem, "amountRequested" | "stockSnapshotId">
        | { id: string } & Pick<RequestedStockItem, "amountRequested" | "stockSnapshotId">
}) => {
    let newState = { ...state };

    switch (type) {
        case ProposedStockRequestsAction.ADD_ASSIGNEE: {
            const id = (payload as { id: string }).id;
            if (!id) {
                console.warn("Tried adding a request assignee with an invalid payload!");
                break;
            }

            newState.assignedToUsersId.push(id);
            break;
        }
        case ProposedStockRequestsAction.REMOVE_ASSIGNEE: {
            const id = (payload as { id: string }).id;
            if (!id) {
                console.warn("Tried removing a request assignee with an invalid payload!");
                break;
            }

            newState.assignedToUsersId.splice(
                newState.assignedToUsersId
                    .findIndex(id =>
                            id === (payload as {
                                id: string
                            }).id
                    )
            );
            break;
        }
        case ProposedStockRequestsAction.ADD_ITEM: {
            newState.items.push(payload as Pick<RequestedStockItem, "amountRequested" | "stockSnapshotId">);
            break;
        }
        case ProposedStockRequestsAction.REMOVE_ITEM: {
            newState.items.splice(
                newState.items
                    .findIndex(item =>
                            item.stockSnapshotId === (payload as {
                                id: string
                            }).id
                    )
            );
            break;
        }
        case ProposedStockRequestsAction.UPDATE_ITEM: {
            // TODO: When I actually need this. Too lazy to implement this 😂
            break;
        }
    }

    return newState;
};

const InventoryRequestedItemsContainer: FC<Props> = ({ selectedIds, setSnapshotsLoading, setModalOpen }) => {
    const { trigger: triggerRequestionCreation, isMutating: isCreatingRequest } = useRequestCreationTrigger();
    const { isLoading, data } = FetchCurrentSnapshots(selectedIds);
    const [proposedRequestedItems, dispatchProposedRequestedItems] = useReducer(reducer, {
        assignedToUsersId: [],
        items: []
    });
    const stockSnapshots = useMemo(() => {
        if (!data)
            return [];
        return data.map(i => i.stockSnapshots).flat();
    }, [data]);

    useEffect(() => {
        setSnapshotsLoading(isLoading);
    }, [isLoading, setSnapshotsLoading]);

    const optimisticRequestedItems = useMemo<RequestedStockItemWithOptionalSnapshot[]>(() => {
        return proposedRequestedItems.items.map(item => ({
            ...item,
            stockSnapshot: stockSnapshots.find(snapshot => snapshot.id === item.stockSnapshotId)!,
            createdAt: new Date(),
            updatedAt: new Date(),
            id: v4(),
            stockRequestId: ""
        }));
    }, [proposedRequestedItems, stockSnapshots]);

    return (
        <Fragment>
            <InventoryRequestedItemsTable items={optimisticRequestedItems} />
            <AddRequestedItemsButton
                disabled={isCreatingRequest}
                proposedSnapshotIds={proposedRequestedItems.items.map(item => item.stockSnapshotId)}
                dispatchProposedRequests={dispatchProposedRequestedItems}
                snapshotsLoading={isLoading}
                stockSnapshots={stockSnapshots ?? []}
            />
            <Divider className="my-6" />
            <GenericButton
                type="submit"
                variant="flat"
                isDisabled={isCreatingRequest || !proposedRequestedItems.items.length}
                isLoading={isCreatingRequest}
                onPress={() => {
                    triggerRequestionCreation({
                        dto: proposedRequestedItems
                    })
                        .then(() => {
                            toast.success("Successfully made a new inventory request!");
                            setModalOpen(false);
                        })
                        .catch(err => {
                            console.error(err);
                            errorToast(err, "There was an error creating your inventory request!");
                        });
                }}
            >
                Create Request
            </GenericButton>
        </Fragment>
    );
};

export default InventoryRequestedItemsContainer;