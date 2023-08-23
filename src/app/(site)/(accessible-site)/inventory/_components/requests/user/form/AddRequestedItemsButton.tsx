"use client";

import { Dispatch, FC, Fragment, useState } from "react";
import { RequestedStockItem, StockSnapshot } from "@prisma/client";
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

interface Props {
    disabled?: boolean,
    snapshotsLoading: boolean;
    proposedSnapshotIds: string[];
    dispatchProposedRequests: Dispatch<{
        type: ProposedStockRequestsAction,
        payload: { id: string }
            | Pick<RequestedStockItem, "amountRequested" | "stockSnapshotId">
            | { id: string } & Pick<RequestedStockItem, "amountRequested" | "stockSnapshotId">
    }>;
    stockSnapshots: StockSnapshot[];
}

const AddRequestedItemsButton: FC<Props> = ({
                                                disabled,
                                                snapshotsLoading,
                                                proposedSnapshotIds,
                                                stockSnapshots,
                                                dispatchProposedRequests
                                            }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>();

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        dispatchProposedRequests({
            type: ProposedStockRequestsAction.ADD_ITEM,
            payload: {
                amountRequested: Number(data.amount_requested),
                stockSnapshotId: selectedItemIds[0]
            }
        });

        setSelectedItemIds([]);
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
                            items={stockSnapshots.sort((a, b) => a.name.localeCompare(b.name))}
                            disabled={snapshotsLoading}
                            selectedKeys={selectedItemIds}
                            disabledKeys={proposedSnapshotIds}
                            onSelectionChange={keys => setSelectedItemIds(Array.from(keys) as string[])}
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
                isDisabled={!stockSnapshots.length || snapshotsLoading || disabled}
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