"use client";

import { Prisma, StockSnapshot } from "@prisma/client";
import {
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from "@nextui-org/react";
import addIcon from "/public/icons/add-2.svg";
import minusIcon from "/public/icons/minus.svg";
import moreIcon from "/public/icons/more.svg";
import IconButton from "../../../../../../_components/inputs/IconButton";
import StockOptionsDropdown from "./StockOptionsDropdown";
import AddStockModal from "./AddStockModal";
import { useCallback, useReducer, useState } from "react";
import ConfirmationModal from "../../../../../../_components/ConfirmationModal";
import RemoveStockModal from "./RemoveStockModal";
import StockQuantityField from "./StockQuantityField";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { sendToast } from "../../../../../../../utils/Hooks";
import SubTitle from "../../../../../../_components/text/SubTitle";

type Props = {
    inventoryName: string,
    stock?: StockSnapshot[],
    mutationAllowed?: boolean
}

type Column = {
    key: string,
    value: string,
}


export const columns: Column[] = [
    {
        key: "stock_name",
        value: "Name"
    },
    {
        key: "stock_quantity",
        value: "Quantity"
    },
    {
        key: "stock_actions",
        value: "Actions"
    }
];

type SetStockItemProps = {
    arg: {
        item: StockSnapshot,
        quantity: number
    }
}

const SetStockItem = (inventoryName: string) => {
    const mutator = (url: string, { arg }: SetStockItemProps) => axios.post(url.replaceAll("{item_id}", arg.item.uid), { quantity: arg.quantity });
    return useSWRMutation(`/api/inventory/${inventoryName}/stock/{item_id}/quantity`, mutator);
};

enum StockAction {
    UPDATE
}

const reducer = (state: StockSnapshot[], action: { type: StockAction, payload: Partial<StockSnapshot> }) => {
    let newState = [...state];

    switch (action.type) {
        case StockAction.UPDATE: {
            const index = state.findIndex(item => item.uid === action.payload.uid);
            newState[index] = {
                ...newState[index],
                ...action.payload
            };
            break;
        }
        default: {
            newState = state;
        }
    }

    return newState;
};

export default function StockTable({ inventoryName, stock, mutationAllowed }: Props) {
    const [stockState, dispatchStockState] = useReducer(reducer, stock ?? []);
    const [addStockModalOpen, setAddStockModalOpen] = useState(false);
    const [removeStockModalOpen, setRemoveStockModalOpen] = useState(false);
    const [deleteStockModalOpen, setDeleteStockModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<StockSnapshot>();
    const {
        trigger: triggerStockUpdate,
        isMutating: isUpdating
    } = SetStockItem(inventoryName);

    const getKeyValue = useCallback((item: StockSnapshot, key: Prisma.Key) => {
        if (key === "stock_name")
            return item.name;
        if (key === "stock_quantity")
            return <StockQuantityField
                disabled={isUpdating || !mutationAllowed}
                submitHandler={(data, setEditMode) => {
                    triggerStockUpdate({
                        item: item,
                        quantity: Number(data.quantity)
                    })
                        .then((res) => {
                            dispatchStockState({
                                type: StockAction.UPDATE,
                                payload: {
                                    uid: item.uid,
                                    quantity: res.data.quantity
                                }
                            });
                            sendToast({
                                description: `Successfully updated ${item.name}!`
                            });
                            setEditMode(false);
                        })
                        .catch(e => {
                            console.error(e);
                            sendToast({
                                error: e,
                                description: `Failed to update ${item.name}!`
                            });
                        });
                }}
                stock={item}
            />;
        if (key === "stock_actions")
            return (
                <div className="flex gap-3">
                    <div className="flex gap-8 p-3 default-container !rounded-xl w-fit">
                        <IconButton
                            isDisabled={isUpdating || !mutationAllowed}
                            icon={addIcon}
                            toolTip="Increment"
                            onPress={() => {
                                setSelectedItem(item);
                                triggerStockUpdate({ item, quantity: item.quantity + 1 })
                                    .then(() => {
                                        dispatchStockState({
                                            type: StockAction.UPDATE,
                                            payload: {
                                                uid: item.uid,
                                                quantity: item.quantity + 1
                                            }
                                        });
                                        sendToast({
                                            description: `Successfully incremented ${item.name}!`
                                        });
                                    })
                                    .catch(e => {
                                        console.error(e);
                                        sendToast({
                                            error: e,
                                            description: `Failed to increment ${item.name}!`
                                        });
                                    });
                            }}
                        />
                        <IconButton
                            isDisabled={isUpdating || !mutationAllowed}
                            icon={minusIcon}
                            toolTip="Decrement"
                            onPress={() => {
                                setSelectedItem(item);
                                triggerStockUpdate({ item, quantity: item.quantity - 1 })
                                    .then(() => {
                                        dispatchStockState({
                                            type: StockAction.UPDATE,
                                            payload: {
                                                uid: item.uid,
                                                quantity: item.quantity - 1
                                            }
                                        });
                                        sendToast({
                                            description: `Successfully decremented ${item.name}!`
                                        });
                                    })
                                    .catch(e => {
                                        console.error(e);
                                        sendToast({
                                            error: e,
                                            description: `Failed to decrement ${item.name}!`
                                        });
                                    });
                            }}
                        />
                    </div>
                    <div className="flex  p-3 default-container !rounded-xl w-fit">
                        <IconButton
                            isDisabled={isUpdating || !mutationAllowed}
                            icon={moreIcon}
                            toolTip="More Options"
                            withDropdown={
                                <StockOptionsDropdown
                                    onAdd={() => {
                                        setSelectedItem(item);
                                        setAddStockModalOpen(true);
                                    }}
                                    onRemove={() => {
                                        setSelectedItem(item);
                                        setRemoveStockModalOpen(true);
                                    }}
                                    onDelete={() => {
                                        setSelectedItem(item);
                                        setDeleteStockModalOpen(true);
                                    }}
                                />
                            }
                        />
                    </div>
                </div>
            );
        return undefined;
    }, [isUpdating, mutationAllowed, triggerStockUpdate]);

    return (
        <>
            <AddStockModal
                onSubmit={(data) => {
                    if (!mutationAllowed)
                        return;

                    triggerStockUpdate({
                        item: selectedItem!,
                        quantity: selectedItem!.quantity + Number(data.quantity)
                    })
                        .then((res) => {
                            dispatchStockState({
                                type: StockAction.UPDATE,
                                payload: {
                                    uid: selectedItem!.uid,
                                    quantity: res.data.quantity
                                }
                            });
                            sendToast({
                                description: `Successfully updated ${selectedItem!.name}!`
                            });
                            setAddStockModalOpen(false);
                        })
                        .catch(e => {
                            console.error(e);
                            sendToast({
                                error: e,
                                description: `Failed to update ${selectedItem!.name}!`
                            });
                        });
                }}
                disabled={isUpdating}
                isOpen={addStockModalOpen}
                setOpen={setAddStockModalOpen}
                onClose={() => setSelectedItem(undefined)}
                item={selectedItem}
            />
            <RemoveStockModal
                disabled={isUpdating}
                onSubmit={(data) => {
                    if (!mutationAllowed)
                        return;

                    triggerStockUpdate({
                        item: selectedItem!,
                        quantity: selectedItem!.quantity - Number(data.quantity)
                    })
                        .then((res) => {
                            dispatchStockState({
                                type: StockAction.UPDATE,
                                payload: {
                                    uid: selectedItem!.uid,
                                    quantity: res.data.quantity
                                }
                            });
                            sendToast({
                                description: `Successfully updated ${selectedItem!.name}!`
                            });
                            setRemoveStockModalOpen(false);
                        })
                        .catch(e => {
                            console.error(e);
                            sendToast({
                                error: e,
                                description: `Failed to update ${selectedItem!.name}!`
                            });
                        });
                }}
                isOpen={removeStockModalOpen}
                setOpen={setRemoveStockModalOpen}
                onClose={() => setSelectedItem(undefined)}
                item={selectedItem}
            />
            <ConfirmationModal
                isOpen={deleteStockModalOpen}
                setOpen={setDeleteStockModalOpen}
                title={`Delete ${selectedItem?.name}`}
                message={
                    `Are you sure you want to delete ${selectedItem?.name
                        ?.replace(
                            /(\w)(\w*)/g,
                            (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()
                        )
                    }?`
                }
                onAccept={() => {
                    if (!mutationAllowed)
                        return;

                    setDeleteStockModalOpen(false);
                }}
            />
            {
                stockState.length ?
                    (
                        <Table
                            isStriped={true}
                            className="!bg-secondary/20"
                            aria-label="Stock Table"
                        >
                            <TableHeader columns={columns}>
                                {column => <TableColumn key={column.key}>{column.value}</TableColumn>}
                            </TableHeader>
                            <TableBody items={stockState}>
                                {item => (
                                    <TableRow key={item.uid}>
                                        {columnKey => <TableCell
                                            className="capitalize">{getKeyValue(item, columnKey)}</TableCell>}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    ) :
                    <SubTitle>There are no items...</SubTitle>
            }

        </>
    );
}