"use client";

import { FC, Fragment, useState } from "react";
import PlusIcon from "../../../../../../../../_components/icons/PlusIcon";
import MinusIcon from "../../../../../../../../_components/icons/MinusIcon";
import GenericDropdown from "../../../../../../../../_components/GenericDropdown";
import { Button, DropdownItem, DropdownSection } from "@nextui-org/react";
import VerticalDotsIcon from "../../../../../../../../_components/icons/VerticalDotsIcon";
import TrashIcon from "../../../../../../../../_components/icons/TrashIcon";
import ConfirmationModal from "../../../../../../../../_components/ConfirmationModal";
import { StockSnapshot, StockType } from "@prisma/client";
import AddStockButton from "./AddStockButton";
import RemoveStockButton from "./RemoveStockButton";
import AddStockModal from "./modals/AddStockModal";
import RemoveStockModal from "./modals/RemoveStockModal";
import EditIcon from "../../../../../../../../_components/icons/EditIcon";
import EditStockTypeModal from "./modals/EditStockTypeModal";
import { toast } from "react-hot-toast";

type Props = {
    item: StockSnapshot,
    onQuantityIncrement: (item: StockSnapshot, incrementedBy: number) => Promise<void>,
    onQuantityDecrement: (item: StockSnapshot, decrementedBy: number) => Promise<void>,
    onStockDelete: (deletedIds: string[]) => void;
    onItemTypeEdit?: (itemUID: string, newType: StockType) => Promise<void>,
    showItemTypeEditAction?: boolean
}

const StockTableActions: FC<Props> = ({
                                          item,
                                          onQuantityDecrement,
                                          onQuantityIncrement,
                                          onStockDelete,
                                          onItemTypeEdit,
                                          showItemTypeEditAction
                                      }) => {
    const [addStockModalOpen, setAddStockModalOpen] = useState(false);
    const [removeStockModalOpen, setRemoveStockModalOpen] = useState(false);
    const [editStockTypeModalOpen, setEditStockTypeStockModalOpen] = useState(false);
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
            {showItemTypeEditAction &&
                <EditStockTypeModal
                    item={item}
                    isOpen={editStockTypeModalOpen}
                    setOpen={setEditStockTypeStockModalOpen}
                    onEdit={async (newType) => {
                        if (onItemTypeEdit) {
                            onItemTypeEdit(item.uid, newType);
                            setEditStockTypeStockModalOpen(false);
                        } else toast.error("There was no action defined for editing the stock type!");
                    }}
                />
            }

            <ConfirmationModal
                isOpen={deleteModalOpen}
                setOpen={setDeleteModalOpen}
                title={`Delete ${item.name.replaceAll("-", " ")}`}
                message={`Are you sure you want to delete ${item.name.replaceAll("-", " ")}`}
                onAccept={() => {
                    onStockDelete([item.uid]);
                    setDeleteModalOpen(false);
                }}
            />
            <div className="flex gap-3">
                <div className="flex gap-4 p-3 w-fit">
                    <AddStockButton
                        item={item}
                        onQuantityIncrement={onQuantityIncrement}
                    />
                    <RemoveStockButton
                        item={item}
                        onQuantityDecrement={onQuantityDecrement}
                    />
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
                                case "edit_type": {
                                    setEditStockTypeStockModalOpen(true);
                                    break;
                                }
                            }
                        }}
                    >
                        {/*@ts-ignore*/}
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
                            {showItemTypeEditAction &&
                                <DropdownItem
                                    key="edit_type"
                                    description="Edit the stock type of this item"
                                    startContent={<EditIcon />}
                                >
                                    Edit Stock Type
                                </DropdownItem>
                            }
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
    )
        ;
};

export default StockTableActions;