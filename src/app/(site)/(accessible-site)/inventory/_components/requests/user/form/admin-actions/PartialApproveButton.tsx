"use client";

import { FC, Fragment, useState } from "react";
import IconButton from "../../../../../../../../_components/inputs/IconButton";
import CheckIcon from "../../../../../../../../_components/icons/CheckIcon";
import GenericModal from "../../../../../../../../_components/GenericModal";
import { RequestedStockItemWithOptionalStockAndRequest } from "../../../inventory-requests-utils";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericInput from "../../../../../../../../_components/inputs/GenericInput";
import { Divider } from "@nextui-org/divider";
import GenericButton from "../../../../../../../../_components/inputs/GenericButton";

type Props = {
    item: Partial<RequestedStockItemWithOptionalStockAndRequest>,
    disabled?: boolean,
    max?: number,
    onPartialApprove?: (item: Partial<RequestedStockItemWithOptionalStockAndRequest>, approvedAmount: number) => void
}

const PartialApproveButton: FC<Props> = ({ item, onPartialApprove, disabled, max }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const { handleSubmit, register, formState: { errors } } = useForm();

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        if (onPartialApprove)
            onPartialApprove(item, Number(data.amount_approved));
        setModalOpen(false);
    };

    return (
        <Fragment>
            <GenericModal
                title={`Partially Approve ${item.stock?.name.replaceAll("-", " ")}`}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <GenericInput
                        register={register}
                        isRequired
                        id="amount_approved"
                        label="How much stock would you like to approve?"
                        placeholder="Enter a number..."
                        type="number"
                        max={max ?? (item.amountRequested ? item.amountRequested - 1 : undefined)}
                        min={1}
                    />
                    <Divider className="my-6" />
                    <GenericButton
                        type="submit"
                        variant="flat"
                    >
                        Submit
                    </GenericButton>
                </form>
            </GenericModal>
            <IconButton
                disabled={disabled}
                variant="flat"
                color="warning"
                onPress={() => setModalOpen(true)}
                toolTip="Partially Approve"
            >
                <CheckIcon width={16} />
            </IconButton>
        </Fragment>
    );
};

export default PartialApproveButton;