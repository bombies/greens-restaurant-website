"use client";

import { FC, Fragment, useState } from "react";
import PlusCircledIcon from "../../../../_components/icons/PlusCircledIcon";
import IconButton from "../../../../_components/inputs/IconButton";
import AddLocationModal from "./AddLocationModal";
import { Inventory } from "@prisma/client";

type Props = {
    disabled?: boolean,
    addOptimisticLocation: (location: Inventory) => Promise<void>
}

const AddLocationButton: FC<Props> = ({ disabled, addOptimisticLocation }) => {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <Fragment>
            <AddLocationModal
                addOptimisticLocation={addOptimisticLocation}
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
            />
            <IconButton
                isIconOnly
                variant="light"
                toolTip="Add Location"
                isDisabled={disabled}
                onPress={() => setModalOpen(true)}
            >
                <PlusCircledIcon width={16} />
            </IconButton>
        </Fragment>
    );
};

export default AddLocationButton;