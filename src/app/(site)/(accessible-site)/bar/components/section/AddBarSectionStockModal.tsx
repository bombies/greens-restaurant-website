"use client";

import { Dispatch, FC, SetStateAction, useCallback } from "react";
import GenericModal from "../../../../../_components/GenericModal";
import { InventorySection, StockType } from "@prisma/client";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import useSWR from "swr";
import { CreateBarStockDto } from "../../../../../api/inventory/bar/[name]/[sectionId]/stock/route";
import useSWRMutation from "swr/mutation";
import GenericInput from "../../../../../_components/inputs/GenericInput";
import GenericSelectMenu from "../../../../../_components/GenericSelectMenu";
import { Chip } from "@nextui-org/chip";
import { SelectItem } from "@nextui-org/react";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import PlusIcon from "../../../../../_components/icons/PlusIcon";

type Props = {
    barName?: string,
    section?: InventorySection,
    isOpen: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>
}

const IMPERIAL_DRINKS_MAX = 33;
const QUART_DRINKS_MAX = 24;

type CreateStockItemArgs = {
    arg: {
        dto: CreateBarStockDto
    }
}

const CreateStockItem = (barName?: string, sectionId?: string) => {
    const mutator = (url: string, { arg }: CreateStockItemArgs) => axios.post(url, arg.dto);
    return useSWRMutation(`/api/inventory/bar/${barName}/${sectionId}/stock`, mutator);
};

const AddBarSectionStockModal: FC<Props> = ({ barName, section, isOpen, setOpen }) => {
    const { trigger: createStockItem, isMutating: isCreating } = CreateStockItem(barName, section?.id);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit: SubmitHandler<FieldValues> = useCallback((data) => {
        const { itemName, itemType } = data;
    }, []);


    return (
        <GenericModal
            title={`Add New Stock To ${barName}`}
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
                    <GenericSelectMenu
                        register={register}
                        isDisabled={isCreating}
                        selectionMode="single"
                        isRequired
                        id="itemType"
                        items={Object.keys(StockType)}
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
                                            {item.data?.replaceAll("_", " ")}
                                        </Chip>
                                    ))}
                                </div>
                            );
                        }}
                    >
                        {type => (
                            <SelectItem key={type}>
                                {type.replaceAll("_", " ")}
                            </SelectItem>
                        )}
                    </GenericSelectMenu>
                    <GenericButton
                        variant="flat"
                        type="submit"
                        startContent={<PlusIcon />}
                    >
                        Create
                    </GenericButton>
                </div>
            </form>
        </GenericModal>
    );
};

export default AddBarSectionStockModal;