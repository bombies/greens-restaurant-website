"use client";

import { Dispatch, FC, SetStateAction, useCallback } from "react";
import GenericModal from "../../../../../../_components/GenericModal";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { InventorySnapshotWithExtras } from "../../../../../../api/inventory/[name]/utils";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { Stock, StockSnapshot } from "@prisma/client";
import { errorToast } from "../../../../../../../utils/Hooks";
import GenericInput from "../../../../../../_components/inputs/GenericInput";
import PlusIcon from "../../../../../../_components/icons/PlusIcon";
import GenericButton from "../../../../../../_components/inputs/GenericButton";

type Props = {
    inventoryName: string,
    isOpen: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>,
    addOptimisticStockItem: (item: StockSnapshot) => Promise<void>,
    inventorySnapshot?: InventorySnapshotWithExtras
}

type AddItemProps = {
    arg: {
        name: string,
    }
}

const AddItem = (inventoryName: string) => {
    const mutator = (url: string, { arg }: AddItemProps) => {
        return axios.post(url, { name: arg.name });
    };
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

    const onSubmit: SubmitHandler<FieldValues> = useCallback((data) => {
        if (!inventorySnapshot)
            return;

        const { itemName } = data;
        createStockItem({
            name: itemName
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