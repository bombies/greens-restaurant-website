"use client";

import { Dispatch, FC, SetStateAction, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { FetchAllInventories } from "../../../InventoryGrid";
import { SelectItem } from "@nextui-org/react";
import GenericSelectMenu from "../../../../../../../_components/GenericSelectMenu";
import { Chip } from "@nextui-org/chip";
import InventoryRequestedItemsContainer from "./InventoryRequestedItemsContainer";

type Props = {
    setModalOpen: Dispatch<SetStateAction<boolean>>
}

const NewInventoryRequestForm: FC<Props> = ({ setModalOpen }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>();
    const { data, isLoading } = FetchAllInventories();
    const [snapshotsLoading, setSnapshotsLoading] = useState(false);
    const [selectedInventoryIds, setSelectedInventoryIds] = useState<string[]>([]);

    const onSubmit: SubmitHandler<FieldValues> = (data) => {

    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
                <GenericSelectMenu
                    selectionMode="multiple"
                    id="selected_inventories"
                    placeholder="Select inventories..."
                    items={data}
                    disabled={isLoading || snapshotsLoading}
                    selectedKeys={selectedInventoryIds}
                    onSelectionChange={selection => setSelectedInventoryIds(Array.from(selection) as string[])}
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
                                        {item.data?.name.replaceAll("-", " ")}
                                    </Chip>
                                ))}
                            </div>
                        );
                    }}
                >
                    {(inventory) => (
                        <SelectItem key={inventory.id} className="capitalize">
                            {inventory.name.replaceAll("-", " ")}
                        </SelectItem>
                    )}
                </GenericSelectMenu>
                <InventoryRequestedItemsContainer
                    setSnapshotsLoading={setSnapshotsLoading}
                    selectedIds={selectedInventoryIds}
                    setModalOpen={setModalOpen}
                />
            </div>
        </form>
    )
        ;
};

export default NewInventoryRequestForm;