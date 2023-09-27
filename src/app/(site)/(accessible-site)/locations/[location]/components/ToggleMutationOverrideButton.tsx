"use client";

import { Dispatch, FC, Fragment, SetStateAction, useState } from "react";
import GenericModal from "../../../../../_components/GenericModal";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import { Spacer } from "@nextui-org/react";
import GenericCard from "../../../../../_components/GenericCard";
import CheckIcon from "../../../../../_components/icons/CheckIcon";
import DeniedIcon from "../../../../../_components/icons/DeniedIcon";
import DangerIcon from "../../../../../_components/icons/DangerIcon";

type Props = {
    setMutationOverridden: Dispatch<SetStateAction<boolean>>
}

const ToggleMutationOverrideButton: FC<Props> = ({ setMutationOverridden }) => {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <Fragment>
            <GenericModal
                title="Confirm Mutation Toggle"
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            >
                <p>Are you sure you want to toggle mutation on?</p>
                <Spacer y={4} />
                <GenericCard>
                    <div className="flex gap-x-4">
                        <DangerIcon fill="#ffa700" width={64} />
                        <p className="flex-grow">
                            <span className="font-bold text-warning">NOTE:</span> Mutations are only intended for <span
                            className="font-bold text-warning">Sundays</span>. Toggling this feature and updating items WILL
                            create a new snapshot and will be used for the most recent snapshot when doing checks and
                            balancing.
                        </p>
                    </div>

                </GenericCard>
                <Spacer y={4} />
                <div className="flex gap-4">
                    <GenericButton
                        variant="flat"
                        onPress={() => {
                            setMutationOverridden(true);
                            setModalOpen(false);
                        }}
                        startContent={<CheckIcon />}
                    >
                        {"I'm sure"}
                    </GenericButton>
                    <GenericButton
                        color="danger"
                        onPress={() => setModalOpen(false)}
                        startContent={<DeniedIcon />}
                    >
                        Oh no, take me back!
                    </GenericButton>
                </div>
            </GenericModal>
            <GenericButton
                variant="flat"
                color="danger"
                onPress={() => setModalOpen(true)}
                startContent={<DangerIcon />}
            >
                Override Mutation
            </GenericButton>
        </Fragment>
    );
};

export default ToggleMutationOverrideButton;