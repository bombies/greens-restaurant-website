"use client";

import { Dispatch, FC, Fragment, SetStateAction, useEffect, useMemo, useReducer } from "react";
import useSWR, { KeyedMutator } from "swr";
import { fetcher } from "../../../../../employees/_components/EmployeeGrid";
import {
    InventorySnapshotWithInventoryAndStockSnapshots,
    InventoryWithOptionalStock
} from "../../../../../../../api/inventory/[name]/utils";
import InventoryRequestedItemsTable from "./InventoryRequestedItemsTable";
import AddRequestedItemsButton from "./AddRequestedItemsButton";
import { CreateStockRequestDto } from "../../../../../../../api/inventory/requests/me/route";
import { RequestedStockItem } from "@prisma/client";
import {
    RequestedStockItemWithOptionalStock,
    StockRequestWithOptionalCreatorAndAssignees
} from "../../inventory-requests-utils";
import { v4 } from "uuid";
import { Divider } from "@nextui-org/divider";
import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import { useRequestCreationTrigger } from "../TriggerRequestCreationProvider";
import { toast } from "react-hot-toast";
import { errorToast } from "../../../../../../../../utils/Hooks";

interface Props {
    selectedIds: string[];
    selectedAssigneeIds: string[];
    setSnapshotsLoading: Dispatch<SetStateAction<boolean>>;
    setModalOpen: Dispatch<SetStateAction<boolean>>;
    mutator: KeyedMutator<StockRequestWithOptionalCreatorAndAssignees[] | undefined>;
    visibleData?: StockRequestWithOptionalCreatorAndAssignees[];
}

const FetchCurrentSnapshots = (ids: string[]) => {
    return useSWR(`/api/inventory/currentsnapshots?ids=${ids.toString()}`, fetcher<InventorySnapshotWithInventoryAndStockSnapshots[]>);
};

const FetchInventories = (ids: string[], withStock?: boolean) => {
    return useSWR(`/api/inventory?${ids.length ? `ids=${ids.toString()}&` : ""}with_stock=${withStock ?? false}`, fetcher<InventoryWithOptionalStock[]>);
};

export enum ProposedStockRequestsAction {
    ADD_ASSIGNEE,
    REMOVE_ASSIGNEE,
    SET_ASSIGNEES,
    ADD_ITEM,
    REMOVE_ITEM,
    UPDATE_ITEM,
}

const reducer = (state: CreateStockRequestDto, { type, payload }: {
    type: ProposedStockRequestsAction,
    payload: { id: string }
        | { ids: string[] }
        | Pick<RequestedStockItem, "amountRequested" | "stockId">
        | { id: string } & Pick<RequestedStockItem, "amountRequested" | "stockId">
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
        case ProposedStockRequestsAction.SET_ASSIGNEES: {
            const ids = (payload as { ids: string[] }).ids;
            if (!ids) {
                console.warn("Tried setting request assignees with an invalid payload!");
                break;
            }
            newState.assignedToUsersId = ids;
            break;
        }
        case ProposedStockRequestsAction.ADD_ITEM: {
            newState.items.push(payload as Pick<RequestedStockItem, "amountRequested" | "stockId">);
            break;
        }
        case ProposedStockRequestsAction.REMOVE_ITEM: {
            newState.items.splice(
                newState.items
                    .findIndex(item =>
                            item.stockId === (payload as {
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

const InventoryRequestedItemsContainer: FC<Props> = ({
                                                         selectedIds,
                                                         selectedAssigneeIds,
                                                         setSnapshotsLoading,
                                                         setModalOpen,
                                                         mutator,
                                                         visibleData
                                                     }) => {
    const { trigger: triggerRequestionCreation, isMutating: isCreatingRequest } = useRequestCreationTrigger();
    const { isLoading, data } = FetchInventories(selectedIds, true);
    const [proposedRequestedItems, dispatchProposedRequestedItems] = useReducer(reducer, {
        assignedToUsersId: selectedAssigneeIds,
        items: []
    });
    const stock = useMemo(() => {
        if (!data)
            return [];
        return data.map(i => i.stock ?? []).flat();
    }, [data]);

    useEffect(() => {
        dispatchProposedRequestedItems({
            type: ProposedStockRequestsAction.SET_ASSIGNEES,
            payload: {
                ids: selectedAssigneeIds
            }
        });
    }, [selectedAssigneeIds]);

    useEffect(() => {
        setSnapshotsLoading(isLoading);
    }, [isLoading, setSnapshotsLoading]);

    const optimisticRequestedItems = useMemo<RequestedStockItemWithOptionalStock[]>(() => {
        return proposedRequestedItems.items.map(item => ({
            ...item,
            stock: stock.find(snapshot => snapshot.id === item.stockId)!,
            createdAt: new Date(),
            updatedAt: new Date(),
            id: v4(),
            stockRequestId: ""
        }));
    }, [proposedRequestedItems, stock]);

    return (
        <Fragment>
            <InventoryRequestedItemsTable items={optimisticRequestedItems} />
            <AddRequestedItemsButton
                disabled={isCreatingRequest}
                proposedSnapshotIds={proposedRequestedItems.items.map(item => item.stockId)}
                dispatchProposedRequests={dispatchProposedRequestedItems}
                snapshotsLoading={isLoading}
                stock={stock ?? []}
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
                        .then((res) => {
                            const data: StockRequestWithOptionalCreatorAndAssignees = res.data;

                            // Set optimistic data
                            mutator(visibleData ? [...visibleData, data] : [data]);

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