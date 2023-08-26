"use client";

import GenericButton from "../../../../../_components/inputs/GenericButton";
import saveIcon from "/public/icons/save.svg";
import trashIcon from "/public/icons/trash.svg";
import SlidingBar from "../../../../../_components/SlidingBar";
import { JSX } from "react";

type Props = {
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
    }
}

export default function ChangesMadeBar({ changesMade, onAccept, onReject, isChanging, label, saveButtonConfig, rejectButtonConfig }: Props) {
    return (
        <SlidingBar visible={changesMade} className="justify-between">
            <p className="text-xl phone:text-lg self-center">{label || "Careful - You have unsaved changes!"}</p>
            <div className="flex tablet:flex-col gap-4">
                <GenericButton
                    onPress={() => onAccept()}
                    disabled={!changesMade || isChanging}
                    isLoading={isChanging}
                    icon={saveButtonConfig?.icon ? undefined : saveIcon}
                    startContent={saveButtonConfig?.icon}
                >
                    {saveButtonConfig?.label ?? "Save"}
                </GenericButton>
                <GenericButton
                    color="danger"
                    onPress={() => onReject()}
                    disabled={!changesMade || isChanging}
                    icon={rejectButtonConfig?.icon ? undefined : trashIcon}
                    startContent={rejectButtonConfig?.icon}
                >
                    {rejectButtonConfig?.label ?? "Discard"}
                </GenericButton>
            </div>
        </SlidingBar>
    );
}