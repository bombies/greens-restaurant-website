"use client";

import { FC, Fragment, useState } from "react";
import AddStockModal from "./AddStockModal";
import IconButton from "../../../../../../../_components/inputs/IconButton";
import PlusIcon from "../../../../../../../_components/icons/PlusIcon";
import MinusIcon from "../../../../../../../_components/icons/MinusIcon";
import GenericDropdown from "../../../../../../../_components/GenericDropdown";
import { Button, DropdownItem, DropdownSection } from "@nextui-org/react";
import VerticalDotsIcon from "../../../../../../../_components/icons/VerticalDotsIcon";
import TrashIcon from "../../../../../../../_components/icons/TrashIcon";
import { StockSnapshotWithStock } from "../../../../../../../api/inventory/[name]/utils";
import RemoveStockModal from "./RemoveStockModal";
import ConfirmationModal from "../../../../../../../_components/ConfirmationModal";

type Props = {
    item: StockSnapshotWithStock,
    onQuantityIncrement: (item: StockSnapshotWithStock, incrementedBy: number) => Promise<void>,
    onQuantityDecrement: (item: StockSnapshotWithStock, decrementedBy: number) => Promise<void>,
    onStockDelete: (deletedIds: string[]) => void;
}

const StockTableActions: FC<Props> = ({ item, onQuantityDecrement, onQuantityIncrement, onStockDelete }) => {
    const [addStockModalOpen, setAddStockModalOpen] = useState(false);
    const [removeStockModalOpen, setRemoveStockModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    return (
        <Fragment>
            <AddStockModal
                item={item}
                isOpen={addStockModalOpen}
                setOpen={setAddStockModalOpen}
                onAdd={async (added) => {
                    onQuantityIncrement(item, added);
                    setAddStockModalOpen(false);
                }}
            />
            <RemoveStockModal
                item={item}
                isOpen={removeStockModalOpen}
                setOpen={setRemoveStockModalOpen}
                onRemove={async (removed) => {
                    onQuantityDecrement(item, removed);
                    setRemoveStockModalOpen(false);
                }}
            />
            <ConfirmationModal
                isOpen={deleteModalOpen}
                setOpen={setDeleteModalOpen}
                title={`Delete ${item.stock.name.replaceAll("-", " ")}`}
                message={`Are you sure you want to delete ${item.stock.name.replaceAll("-", " ")}`}
                onAccept={() => {
                    onStockDelete([item.uid]);
                    setDeleteModalOpen(false);
                }}
            />
            <div className="flex gap-3">
                <div className="flex gap-4 p-3 w-fit">
                    <IconButton
                        size="sm"
                        variant="flat"
                        toolTip="Increment"
                        cooldown={1}
                        onPress={async () => {
                            await onQuantityIncrement(item, 1);
                        }}
                    >
                        <PlusIcon width={16} />
                    </IconButton>
                    <IconButton
                        size="sm"
                        variant="flat"
                        color="danger"
                        toolTip="Decrement"
                        cooldown={1}
                        onPress={async () => {
                            await onQuantityDecrement(item, 1);
                        }}
                    >
                        <MinusIcon width={16} />
                    </IconButton>
                    <GenericDropdown
                        placement="bottom"
                        trigger={<Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            color="default"
                        >
                            <VerticalDotsIcon width={16} />
                        </Button>}
                        onAction={(key) => {
                            switch (key) {
                                case "add": {
                                    setAddStockModalOpen(true);
                                    break;
                                }
                                case "remove": {
                                    setRemoveStockModalOpen(true);
                                    break;
                                }
                                case "delete": {
                                    setDeleteModalOpen(true);
                                    break;
                                }
                            }
                        }}
                    >
                        <DropdownSection title="Actions" showDivider>
                            <DropdownItem
                                key="add"
                                description="Add a custom amount of stock to this item"
                                startContent={<PlusIcon />}
                            >
                                Add Multiple
                            </DropdownItem>
                            <DropdownItem
                                key="remove"
                                description="Remove a custom amount of stock from this item"
                                startContent={<MinusIcon />}
                            >
                                Remove Multiple
                            </DropdownItem>
                        </DropdownSection>
                        <DropdownSection title="Danger Zone">
                            <DropdownItem
                                key="delete"
                                className="text-danger hover:text-white"
                                color="danger"
                                startContent={<TrashIcon width={16} />}
                            >
                                Delete Item
                            </DropdownItem>
                        </DropdownSection>
                    </GenericDropdown>
                </div>
            </div>
        </Fragment>
    );
};

export default StockTableActions;