"use client";

import { Dispatch, FC, SetStateAction, useCallback, useMemo, useState } from "react";
import GenericModal from "../../../../../_components/GenericModal";
import { Stock, StockSnapshot, StockType } from "@prisma/client";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { CreateBarStockDto } from "../../../../../api/inventory/bar/[name]/[sectionId]/stock/route";
import useSWRMutation from "swr/mutation";
import GenericInput from "../../../../../_components/inputs/GenericInput";
import GenericSelectMenu from "../../../../../_components/GenericSelectMenu";
import { Chip } from "@nextui-org/chip";
import { SelectItem } from "@nextui-org/react";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import PlusIcon from "../../../../../_components/icons/PlusIcon";
import { errorToast } from "../../../../../../utils/Hooks";
import { InventorySectionSnapshotWithExtras } from "../../../../../api/inventory/[name]/types";

type Props = {
    barName?: string,
    sectionSnapshot?: InventorySectionSnapshotWithExtras
    isOpen: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>,
    addOptimisticStockItem: (item: StockSnapshot) => Promise<void>
}

type CreateStockItemArgs = {
    arg: {
        dto: CreateBarStockDto
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
                                                    addOptimisticStockItem
                                                }) => {
    const {
        trigger: createStockItem,
        isMutating: isCreating
    } = CreateStockItem(barName, sectionSnapshot?.inventorySectionId);
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [selectedStockType, setSelectedStockType] = useState<StockType>(StockType.DEFAULT);

    const onSubmit: SubmitHandler<FieldValues> = useCallback((data) => {
        if (!sectionSnapshot)
            return;

        const { itemName, itemType, itemPrice } = data;
        createStockItem({
            dto: { name: itemName, type: itemType.toUpperCase(), price: Number(itemPrice) }
        }).then(async (res) => {
            const createdItem: Stock = res.data;
            await addOptimisticStockItem({
                id: "",
                uid: createdItem.uid,
                quantity: 0,
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

    const selectItems = useMemo(() => Object.keys(StockType).map(type => ({
        key: type,
        label: type.replaceAll("_", " ")
    })), []);

    return (
        <GenericModal
            title={`Add New Item To ${barName}`}
            isOpen={isOpen}
            onClose={() => setOpen(false)}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
                    <GenericInput
                        register={register}
                        id="itemName"
                        label="Item Name"
                        isRequired
                        isDisabled={isCreating}
                    />
                    <GenericInput
                        register={register}
                        errors={errors}
                        id="itemPrice"
                        label="Item Cost"
                        startContent="JMD"
                        isRequired
                        isDisabled={isCreating}
                        type="number"
                        step="0.01"
                    />
                    <GenericSelectMenu
                        isDisabled={isCreating}
                        selectionMode="single"
                        isRequired
                        label="Item Type"
                        id="itemType"
                        placeholder="Select a type..."
                        items={selectItems}
                        register={register}
                        selectedKeys={[selectedStockType.toLowerCase()]}
                        onSelectionChange={selection => setSelectedStockType((Array.from(selection) as StockType[])[0].toUpperCase() as StockType)}
                        variant="flat"
                        renderValue={(items) => {
                            return (
                                <div className="flex flex-wrap gap-2">
                                    {items.map((item) => (
                                        <Chip
                                            color="primary"
                                            variant="flat"
                                            className="capitalize"
                                            key={item.key}
                                        >
                                            {item.data?.label.replaceAll("_", " ")}
                                        </Chip>
                                    ))}
                                </div>
                            );
                        }}
                    >
                        {(type) => (
                            <SelectItem key={type.key.toLowerCase()}>
                                {type.label.replaceAll("_", " ")}
                            </SelectItem>
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