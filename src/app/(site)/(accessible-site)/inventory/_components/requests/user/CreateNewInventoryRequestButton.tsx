"use client";

import { FC, Fragment, useState } from "react";
import GenericButton from "../../../../../../_components/inputs/GenericButton";
import PlusIcon from "../../../../../../_components/icons/PlusIcon";
import GenericModal from "../../../../../../_components/GenericModal";
import NewInventoryRequestForm from "./form/NewInventoryRequestForm";
import { StockRequestWithOptionalExtras } from "@/app/api/inventory/requests/types";

type Props = {
    onRequestCreate: (request: StockRequestWithOptionalExtras) => void
}
const CreateNewInventoryRequestButton: FC<Props> = ({ onRequestCreate }) => {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <Fragment>
            <GenericModal
                size="5xl"
                title="Create A New Inventory Request"
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                isDismissable={false}
            >
                <NewInventoryRequestForm
                    onRequestCreate={onRequestCreate}
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