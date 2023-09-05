"use client";

import { Dispatch, FC, SetStateAction, useCallback, useMemo, useState } from "react";
import GenericModal from "../../../../../../../_components/GenericModal";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { Stock, StockSnapshot, StockType } from "@prisma/client";
import { errorToast } from "../../../../../../../../utils/Hooks";
import GenericInput from "../../../../../../../_components/inputs/GenericInput";
import PlusIcon from "../../../../../../../_components/icons/PlusIcon";
import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import { Chip } from "@nextui-org/chip";
import { SelectItem } from "@nextui-org/react";
import GenericSelectMenu from "../../../../../../../_components/GenericSelectMenu";
import { CreateStockDto } from "../../../../../../../api/inventory/[name]/stock/route";
import { InventorySnapshotWithExtras } from "../../../../../../../api/inventory/[name]/types";

type Props = {
    inventoryName: string,
    isOpen: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>,
    addOptimisticStockItem: (item: StockSnapshot) => Promise<void>,
    inventorySnapshot?: InventorySnapshotWithExtras
}

type AddItemProps = {
    arg: {
        dto: CreateStockDto
    }
}

const AddItem = (inventoryName: string) => {
    const mutator = (url: string, { arg }: AddItemProps) => axios.post(url, arg.dto);
    return useSWRMutation(`/api/inventory/${inventoryName}/stock`, mutator);
};

const AddStockItemModal: FC<Props> = ({
                                          inventoryName,
                                          isOpen,
                                          setOpen,
                                          inventorySnapshot,
                                          addOptimisticStockItem
                                      }) => {
    const {
        trigger: createStockItem,
        isMutating: isCreating
    } = AddItem(inventoryName);
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [selectedStockType, setSelectedStockType] = useState<StockType>(StockType.DEFAULT);

    const selectItems = useMemo(() => Object.keys(StockType).map(type => ({
        key: type,
        label: type.replaceAll("_", " ")
    })), []);

    const onSubmit: SubmitHandler<FieldValues> = useCallback((data) => {
        if (!inventorySnapshot)
            return;

        const { itemName, itemType, itemPrice } = data;
        createStockItem({
            dto: {
                name: itemName,
                type: itemType.toUpperCase(),
                price: Number(itemPrice)
            }
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
                inventorySnapshotId: inventorySnapshot.id,
                inventorySectionSnapshotId: null
            });
            setOpen(false);
            reset();
        })
            .catch(e => {
                console.error(e);
                errorToast(e, "There was an error creating this stock!");
            });
    }, [addOptimisticStockItem, createStockItem, inventorySnapshot, reset, setOpen]);

    return (
        <GenericModal
            title={`Add New Item To ${inventoryName.replaceAll("-", " ")}`}
            isOpen={isOpen}
            onClose={() => setOpen(false)}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
                    <GenericInput
                        register={register}
                        errors={errors}
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

export default AddStockItemModal;