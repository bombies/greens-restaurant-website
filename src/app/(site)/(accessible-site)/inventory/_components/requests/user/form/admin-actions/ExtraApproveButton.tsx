"use client";

import { FC, Fragment, useState } from "react";
import { RequestedStockItemWithOptionalStockAndRequest } from "../../../inventory-requests-utils";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericModal from "../../../../../../../../_components/GenericModal";
import GenericInput from "../../../../../../../../_components/inputs/GenericInput";
import { Divider } from "@nextui-org/divider";
import GenericButton from "../../../../../../../../_components/inputs/GenericButton";
import IconButton from "../../../../../../../../_components/inputs/IconButton";
import DoubleCheckIcon from "../../../../../../../../_components/icons/DoubleCheckIcon";

type Props = {
    item: Partial<RequestedStockItemWithOptionalStockAndRequest>,
    amountAvailable: number,
    onExtraApprove?: (item: Partial<RequestedStockItemWithOptionalStockAndRequest>, approvedAmount: number) => void
}

const ExtraApproveButton: FC<Props> = ({ item, amountAvailable, onExtraApprove }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const { handleSubmit, register, formState: { errors } } = useForm();

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        if (onExtraApprove)
            onExtraApprove(item, Number(data.amount_approved));
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
                        min={item.amountRequested}
                        max={amountAvailable}
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
                isDisabled={item.amountRequested !== undefined ? amountAvailable <= item.amountRequested : false}
                variant="flat"
                color="primary"
                onPress={() => setModalOpen(true)}
                toolTip="Give Extra"
            >
                <DoubleCheckIcon width={16} />
            </IconButton>
        </Fragment>
    );
};

export default ExtraApproveButton