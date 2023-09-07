"use client";

import { Dispatch, FC, Fragment, useState } from "react";
import { RequestedStockItem, Stock } from "@prisma/client";
import GenericModal from "../../../../../../../_components/GenericModal";
import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import PlusIcon from "../../../../../../../_components/icons/PlusIcon";
import GenericSelectMenu from "../../../../../../../_components/GenericSelectMenu";
import { Button, SelectItem } from "@nextui-org/react";
import { Divider } from "@nextui-org/divider";
import "../../../../../../../../utils/GeneralUtils";
import GenericInput from "../../../../../../../_components/inputs/GenericInput";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { ProposedStockRequestsAction } from "./InventoryRequestedItemsContainer";
import useStockQuantityDropdownUtils
    from "../../../../[name]/_components/table/generic/forms/useStockQuantityDropdownUtils";
import StockQuantityDropdown, {
    QuantityUnit
} from "../../../../[name]/_components/table/generic/forms/StockQuantityDropdown";

interface Props {
    disabled?: boolean,
    snapshotsLoading: boolean;
    proposedSnapshotIds: string[];
    dispatchProposedRequests: Dispatch<{
        type: ProposedStockRequestsAction,
        payload: { id: string }
            | Pick<RequestedStockItem, "amountRequested" | "stockId">
            | { id: string } & Pick<RequestedStockItem, "amountRequested" | "stockId">
    }>;
    stock: Stock[];
}

const AddRequestedItemsButton: FC<Props> = ({
                                                disabled,
                                                snapshotsLoading,
                                                proposedSnapshotIds,
                                                stock,
                                                dispatchProposedRequests
                                            }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [quantityUnit, setQuantityUnit] = useState<QuantityUnit>(QuantityUnit.DEFAULT);
    const [currentItem, setCurrentItem] = useState<Stock>();
    const { register, handleSubmit } = useForm<FieldValues>();
    const { isCaseItem, isDrinkBottle, mutateQuantity } = useStockQuantityDropdownUtils({ item: currentItem });

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        const amountRequested = mutateQuantity(Number(data.amount_requested), quantityUnit);

        dispatchProposedRequests({
            type: ProposedStockRequestsAction.ADD_ITEM,
            payload: {
                amountRequested,
                stockId: selectedItemIds[0]
            }
        });

        setSelectedItemIds([]);
        setCurrentItem(undefined);
        setModalOpen(false);
    };


    return (
        <Fragment>
            <GenericModal
                title="Request A New Item"
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-6">
                        <GenericSelectMenu
                            id="selected_item"
                            placeholder="Select an item..."
                            variant="flat"
                            items={stock.sort((a, b) => a.name.localeCompare(b.name))}
                            disabled={snapshotsLoading}
                            selectedKeys={selectedItemIds}
                            disabledKeys={proposedSnapshotIds}
                            onSelectionChange={keys => {
                                const keyArr = Array.from(keys) as string[];
                                setSelectedItemIds(keyArr);

                                if (!keyArr.length)
                                    setCurrentItem(undefined);
                                else {
                                    const lastItem = stock.find(item => item.id === keyArr[keyArr.length - 1]);
                                    if (lastItem)
                                        setCurrentItem(lastItem);
                                }

                            }}
                            renderValue={items => items.map(item => item.data?.name.replaceAll("-", " ").capitalize()).toString()}
                        >
                            {snapshot => (
                                <SelectItem key={snapshot.id} className="capitalize">
                                    {snapshot.name.replaceAll("-", " ")}
                                </SelectItem>
                            )}
                        </GenericSelectMenu>
                        <GenericInput
                            register={register}
                            isRequired
                            disabled={!selectedItemIds.length}
                            id="amount_requested"
                            label="Amount Needed"
                            labelPlacement="outside"
                            placeholder="Enter an amount"
                            type="number"
                            min="1"
                            endContent={(currentItem && (isDrinkBottle() || isCaseItem())) &&
                                <StockQuantityDropdown
                                    item={currentItem}
                                    selectedUnit={quantityUnit}
                                    setSelectedUnit={setQuantityUnit}
                                />
                            }
                        />
                        <Divider className="my-6" />
                        <GenericButton
                            disabled={!selectedItemIds.length}
                            variant="flat"
                            type="submit"
                            startContent={<PlusIcon fill="currentColor" />}
                        >
                            Add Item
                        </GenericButton>
                    </div>
                </form>
            </GenericModal>
            <Button
                isDisabled={!stock.length || snapshotsLoading || disabled}
                color="primary"
                variant="flat"
                isIconOnly
                onPress={() => setModalOpen(true)}
            >
                <PlusIcon fill="currentColor" />
            </Button>
        </Fragment>
    );
};

export default AddRequestedItemsButton;