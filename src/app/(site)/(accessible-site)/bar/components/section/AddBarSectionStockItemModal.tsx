"use client";

import { Dispatch, FC, SetStateAction, useCallback, useMemo } from "react";
import GenericModal from "../../../../../_components/GenericModal";
import { Stock, StockSnapshot } from "@prisma/client";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { AddBarStockDto } from "../../../../../api/inventory/bar/[name]/[sectionId]/stock/route";
import useSWRMutation from "swr/mutation";
import GenericSelectMenu from "../../../../../_components/GenericSelectMenu";
import { SelectItem, SelectSection } from "@nextui-org/react";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import PlusIcon from "../../../../../_components/icons/PlusIcon";
import { errorToast } from "../../../../../../utils/Hooks";
import { InventorySectionSnapshotWithOptionalExtras } from "../../../../../api/inventory/bar/[name]/types";
import { StockWithOptionalExtras } from "../../../../../api/inventory/[name]/types";
import "../../../../../../utils/GeneralUtils";

type Props = {
    barName?: string,
    sectionSnapshot?: InventorySectionSnapshotWithOptionalExtras
    isOpen: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>,
    addOptimisticStockItem: (item: StockSnapshot) => Promise<void>,
    items: StockWithOptionalExtras[]
}

type CreateStockItemArgs = {
    arg: {
        dto: AddBarStockDto
    }
}

const CreateStockItem = (barName?: string, sectionId?: string) => {
    const mutator = (url: string, { arg }: CreateStockItemArgs) => axios.post(url, arg.dto);
    return useSWRMutation(`/api/inventory/bar/${barName}/${sectionId}/stock`, mutator);
};

const AddBarSectionStockItemModal: FC<Props> = ({
                                                    barName,
                                                    sectionSnapshot,
                                                    isOpen,
                                                    setOpen,
                                                    addOptimisticStockItem,
                                                    items
                                                }) => {
    const sectionedItems = useMemo(() => {
        const sectionIds = Array.from(new Set(items.map(item => {
            if (item.inventoryId)
                return item.inventoryId;
            else return item.inventorySectionId!;
        })));

        return sectionIds.map(id => {
            const correspondingItem = items.find(item => item.inventoryId === id || item.inventorySectionId === id)!;
            const correspondingInventory = correspondingItem.inventory ?? correspondingItem.inventorySection!;

            const allStock = items.filter(item => item.inventorySectionId === id || item.inventoryId === id);
            return ({
                id,
                name: correspondingInventory.name,
                items: allStock.sort((a, b) => a.name.localeCompare(b.name))
            });
        });
    }, [items]);

    const {
        trigger: createStockItem,
        isMutating: isCreating
    } = CreateStockItem(barName, sectionSnapshot?.inventorySectionId);
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const onSubmit: SubmitHandler<FieldValues> = useCallback((data) => {
        if (!sectionSnapshot)
            return;

        const { stockId } = data;
        createStockItem({
            dto: { stockId: stockId }
        }).then(async (res) => {
            const createdItem: Stock = res.data;
            await addOptimisticStockItem({
                id: createdItem.id,
                uid: createdItem.uid,
                quantity: 0,
                sellingPrice: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                name: createdItem.name,
                type: createdItem.type,
                price: createdItem.price,
                inventorySectionSnapshotId: sectionSnapshot.id,
                inventorySnapshotId: null
            });
            setOpen(false);
            reset();
        })
            .catch(e => {
                console.error(e);
                errorToast(e, "There was an error creating this stock!");
            });
    }, [addOptimisticStockItem, createStockItem, reset, sectionSnapshot, setOpen]);

    return (
        <GenericModal
            title={`Add New Item To ${barName}`}
            isOpen={isOpen}
            onClose={() => setOpen(false)}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
                    <GenericSelectMenu
                        isDisabled={isCreating}
                        selectionMode="single"
                        isRequired
                        label="Item"
                        id="stockId"
                        placeholder="Select an item..."
                        items={sectionedItems}
                        register={register}
                        variant="flat"
                    >
                        {(item) => (
                            <SelectSection
                                key={item.id}
                                title={item.name.capitalize().replaceAll("-", " ")}
                            >
                                {item.items.map(selectItem => (
                                    <SelectItem
                                        key={selectItem.id}>{selectItem.name.capitalize().replaceAll("-", " ")}</SelectItem>
                                ))}
                            </SelectSection>
                        )}
                    </GenericSelectMenu>
                    <GenericButton
                        variant="flat"
                        type="submit"
                        startContent={<PlusIcon />}
                        disabled={isCreating}
                        isLoading={isCreating}
                    >
                        Create
                    </GenericButton>
                </div>
            </form>
        </GenericModal>
    );
};

export default AddBarSectionStockItemModal;