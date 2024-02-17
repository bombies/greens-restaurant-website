"use state";

import { FC, Fragment, useState } from "react";
import { RequestedStockItemWithOptionalStockAndRequest } from "../../../inventory-requests-utils";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericModal from "../../../../../../../../_components/GenericModal";
import GenericInput from "../../../../../../../../_components/inputs/GenericInput";
import { Divider } from "@nextui-org/divider";
import GenericButton from "../../../../../../../../_components/inputs/GenericButton";
import IconButton from "../../../../../../../../_components/inputs/IconButton";
import EditIcon from "../../../../../../../../_components/icons/EditIcon";
import useStockQuantityDropdownUtils
    from "../../../../../[name]/_components/table/generic/forms/useStockQuantityDropdownUtils";
import StockQuantityDropdown, {
    QuantityUnit
} from "../../../../../[name]/_components/table/generic/forms/StockQuantityDropdown";

interface Props {
    item: Partial<RequestedStockItemWithOptionalStockAndRequest>,
    editing?: boolean,
    onAmountChange?: (item: Partial<RequestedStockItemWithOptionalStockAndRequest>, newAmount: number) => Promise<void>
}

const EditAmountRequestedButton: FC<Props> = ({ item, onAmountChange, editing }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const { handleSubmit, register, formState: { errors } } = useForm();
    const { isCaseItem, isDrinkBottle, mutateQuantity } = useStockQuantityDropdownUtils({ itemType: item.stock?.type });
    const [quantityUnit, setQuantityUnit] = useState<QuantityUnit>(QuantityUnit.DEFAULT);

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        const quantity = mutateQuantity(Number(data.amount_requested), quantityUnit);
        if (onAmountChange)
            await onAmountChange(item, quantity);
        setModalOpen(false);
    };

    return (
        <Fragment>
            <GenericModal
                title={`Edit ${item.stock?.name.replaceAll("-", " ")}`}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <GenericInput
                        disabled={editing}
                        register={register}
                        errors={errors}
                        isRequired
                        id="amount_requested"
                        label="How much stock would you like to request?"
                        placeholder="Enter a number..."
                        type="number"
                        min={1}
                        endContent={
                            (isDrinkBottle() || isCaseItem())
                            &&
                            <StockQuantityDropdown
                                itemType={item.stock?.type}
                                selectedUnit={quantityUnit}
                                setSelectedUnit={setQuantityUnit}
                            />
                        }
                    />
                    <Divider className="my-6" />
                    <GenericButton
                        disabled={editing}
                        isLoading={editing}
                        type="submit"
                        variant="flat"
                    >
                        Submit
                    </GenericButton>
                </form>
            </GenericModal>
            <IconButton
                variant="flat"
                color="warning"
                onPress={() => setModalOpen(true)}
                toolTip="Edit Amount Requested"
            >
                <EditIcon width={16} />
            </IconButton>
        </Fragment>
    );
};

export default EditAmountRequestedButton;