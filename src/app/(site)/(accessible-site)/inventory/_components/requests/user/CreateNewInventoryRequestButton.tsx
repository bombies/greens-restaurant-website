"use client";

import { FC, Fragment, useState } from "react";
import GenericButton from "../../../../../../_components/inputs/GenericButton";
import PlusIcon from "../../../../../../_components/icons/PlusIcon";
import GenericModal from "../../../../../../_components/GenericModal";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import NewInventoryRequestForm from "./form/NewInventoryRequestForm";
import { KeyedMutator } from "swr";
import { StockRequestWithOptionalCreatorAndAssignees } from "../inventory-requests-utils";

type Props = {
    visibleData?: StockRequestWithOptionalCreatorAndAssignees[],
    mutator: KeyedMutator<StockRequestWithOptionalCreatorAndAssignees[] | undefined>
}
const CreateNewInventoryRequestButton: FC<Props> = ({mutator, visibleData}) => {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <Fragment>
            <GenericModal
                size="5xl"
                title="Create A New Inventory Request"
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            >
                <NewInventoryRequestForm
                    mutator={mutator}
                    visibleData={visibleData}
                    setModalOpen={setModalOpen}
                />
            </GenericModal>
            <GenericButton
                startContent={<PlusIcon fill="currentColor" />}
                variant="flat"
                onPress={() => setModalOpen(true)}
            >
                New Request
            </GenericButton>
        </Fragment>
    );
};

export default CreateNewInventoryRequestButton;