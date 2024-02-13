"use client";

import { Dispatch, FC, Fragment, SetStateAction, useState } from "react";
import SlidingBar from "../../../../../../../_components/SlidingBar";
import GenericButton from "../../../../../../../_components/inputs/GenericButton";
import ConfirmationModal from "../../../../../../../_components/ConfirmationModal";
import TrashIcon from "../../../../../../../_components/icons/TrashIcon";
import DeniedIcon from "../../../../../../../_components/icons/DeniedIcon";

type Props = {
    selectedIds: string[]
    setSelectedIds: Dispatch<SetStateAction<string[]>>
    onDelete: (deletedIds: string[]) => Promise<void>
}

const ItemsSelectedBar: FC<Props> = ({ onDelete, selectedIds, setSelectedIds }) => {
    const [confirmationVisible, setConfirmationVisible] = useState(false);

    return (
        <Fragment>
            <ConfirmationModal
                isOpen={confirmationVisible}
                setOpen={setConfirmationVisible}
                title="Delete Items"
                message={`Are you sure you want to delete ${selectedIds.length} items?`}
                onAccept={() => {
                    const pastSelectedIds = selectedIds;
                    onDelete(Array.from(selectedIds) as string[])
                        .catch((e) => {
                            console.error(e);
                            setSelectedIds(pastSelectedIds);
                        });
                    setConfirmationVisible(false);
                    setSelectedIds([]);
                }}
            />
            <SlidingBar
                visible={selectedIds.length > 0}
                className="justify-between gap-4 phone:flex-col"
            >
                <p className="self-center break-words tablet:text-sm">You have <span
                    className="text-warning">{selectedIds.length} item{selectedIds.length > 1 ? "s" : ""}</span> selected.
                </p>
                <div className="flex phone:flex-col gap-4">
                    <GenericButton
                        color="danger"
                        variant="flat"
                        startContent={<TrashIcon />}
                        onPress={() => {
                            setConfirmationVisible(true);
                        }}
                    >
                        Delete
                    </GenericButton>
                    <GenericButton
                        color="warning"
                        variant="flat"
                        startContent={<DeniedIcon />}
                        onPress={() => {
                            setSelectedIds([]);
                        }}
                    >
                        Clear Selection
                    </GenericButton>
                </div>

            </SlidingBar>
        </Fragment>
    );
};

export default ItemsSelectedBar;