"use client";

import { FC, Fragment, useState } from "react";
import GenericButton from "../../../../../../_components/inputs/GenericButton";
import PlusIcon from "../../../../../../_components/icons/PlusIcon";
import GenericModal from "../../../../../../_components/GenericModal";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import NewInventoryRequestForm from "./form/NewInventoryRequestForm";

const CreateNewInventoryRequestButton: FC = () => {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <Fragment>
            <GenericModal
                size="5xl"
                title="Create A New Inventory Request"
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            >
                <NewInventoryRequestForm setModalOpen={setModalOpen} />
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