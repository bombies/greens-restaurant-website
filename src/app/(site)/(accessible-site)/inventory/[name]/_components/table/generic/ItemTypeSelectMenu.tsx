"use client";

import { Dispatch, FC, SetStateAction, useMemo } from "react";
import { StockType } from "@prisma/client";
import { Chip } from "@nextui-org/chip";
import { SelectItem } from "@nextui-org/react";
import GenericSelectMenu from "../../../../../../../_components/GenericSelectMenu";
import { FieldValues, UseFormRegister } from "react-hook-form";

type Props = {
    selectedStockType: StockType,
    setSelectedStockType: Dispatch<SetStateAction<StockType>>,
    isCreating?: boolean,
    register: UseFormRegister<FieldValues>
}

const ItemTypeSelectMenu: FC<Props> = ({ selectedStockType, setSelectedStockType, isCreating, register }) => {
    const selectItems = useMemo(() => Object.keys(StockType).map(type => ({
        key: type,
        label: type.replaceAll("_", " ")
    })), []);

    return (
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
    );
};

export default ItemTypeSelectMenu;