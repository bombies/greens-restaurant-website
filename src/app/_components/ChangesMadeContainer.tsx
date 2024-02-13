"use client";

import { FC, JSX } from "react";
import GenericButton from "./inputs/GenericButton";
import CheckIcon from "./icons/CheckIcon";
import TrashIcon from "./icons/TrashIcon";

export type ChangesMadeContainerProps = {
    changesMade: boolean,
    isChanging: boolean,
    onAccept: () => void,
    onReject: () => void,
    label?: string,
    saveButtonConfig?: {
        icon?: JSX.Element,
        label?: string
    }
    rejectButtonConfig?: {
        icon?: JSX.Element,
        label?: string
    },
}

const ChangesMadeContainer: FC<ChangesMadeContainerProps> = ({
                                                                 changesMade,
                                                                 isChanging,
                                                                 onReject,
                                                                 rejectButtonConfig,
                                                                 saveButtonConfig,
                                                                 label,
                                                                 onAccept
                                                             }) => {
    return (
        <>
            <p className="text-xl tablet:text-lg self-center">{label || "Careful - You have unsaved changes!"}</p>
            <div className="flex phone:flex-col gap-4">
                <GenericButton
                    onPress={() => onAccept()}
                    disabled={!changesMade || isChanging}
                    isLoading={isChanging}
                    startContent={saveButtonConfig?.icon ?? <CheckIcon />}
                >
                    {saveButtonConfig?.label ?? "Save"}
                </GenericButton>
                <GenericButton
                    color="danger"
                    onPress={() => onReject()}
                    disabled={!changesMade || isChanging}
                    startContent={rejectButtonConfig?.icon ?? <TrashIcon />}
                >
                    {rejectButtonConfig?.label ?? "Discard"}
                </GenericButton>
            </div>
        </>
    );
};

export default ChangesMadeContainer