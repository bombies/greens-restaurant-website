"use client";

import { Dispatch, FC, Fragment, SetStateAction, useEffect, useMemo, useReducer } from "react";
import useSWR, { KeyedMutator } from "swr";
import { fetcher } from "../../../../../employees/_components/EmployeeGrid";
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
import { InventoryWithOptionalExtras } from "../../../../../../../api/inventory/[name]/types";

interface Props {
    selectedIds: string[];
    selectedAssigneeIds: string[];
    setSnapshotsLoading: Dispatch<SetStateAction<boolean>>;
    setModalOpen: Dispatch<SetStateAction<boolean>>;
    mutator: KeyedMutator<StockRequestWithOptionalCreatorAndAssignees[] | undefined>;
    visibleData?: StockRequestWithOptionalCreatorAndAssignees[];
}

const FetchInventories = (ids: string[], withStock?: boolean) => {
    return useSWR(`/api/inventory?${ids.length ? `ids=${ids.toString()}&` : ""}with_stock=${withStock ?? false}`, fetcher<InventoryWithOptionalExtras[]>);
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
        | Pick<RequestedStockItem, "amountRequested" | "stockId" | "stockUID">
        | { id: string } & Pick<RequestedStockItem, "amountRequested">
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
            newState.items.push(payload as Pick<RequestedStockItem, "amountRequested" | "stockId" | "stockUID">);
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
            const { id, amountRequested } = (payload as {
                id: string
            } & Pick<RequestedStockItem, "amountRequested">);
            if (!id || !amountRequested) {
                console.warn("Tried setting updating request item with an invalid payload!", payload);
                break;
            }

            const index = newState.items
                .findIndex(item =>
                        item.stockId === (payload as {
                            id: string
                        }).id
                );

            const oldItem = newState.items[index];
            newState.items[index] = {
                ...oldItem,
                amountRequested
            };
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
    const { trigger: triggerRequestCreation, isMutating: isCreatingRequest } = useRequestCreationTrigger();
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
            stockRequestId: "",
            amountProvided: null
        }));
    }, [proposedRequestedItems, stock]);

    return (
        <Fragment>
            <InventoryRequestedItemsTable
                editAllowed={true}
                items={optimisticRequestedItems}
                onSelfAction={{
                    onAmountChange: {
                        async action(item, newAmount) {
                            dispatchProposedRequestedItems({
                                type: ProposedStockRequestsAction.UPDATE_ITEM,
                                payload: {
                                    id: item.stock!.id,
                                    amountRequested: newAmount
                                }
                            });
                        }
                    },
                    onRemove: {
                        async action(item) {
                            dispatchProposedRequestedItems({
                                type: ProposedStockRequestsAction.REMOVE_ITEM,
                                payload: { id: item.stock!.id }
                            });
                        }
                    }
                }}
            />
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
                    triggerRequestCreation({
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