"use client";

import GenericButton from "../../../../../_components/inputs/GenericButton";
import SlidingBar from "../../../../../_components/SlidingBar";
import { JSX } from "react";
import TrashIcon from "../../../../../_components/icons/TrashIcon";
import CheckIcon from "../../../../../_components/icons/CheckIcon";
import clsx from "clsx";

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
    },
    className?: string
}

export default function ChangesMadeBar({
                                           changesMade,
                                           onAccept,
                                           onReject,
                                           isChanging,
                                           label,
                                           saveButtonConfig,
                                           rejectButtonConfig,
                                           className
                                       }: Props) {
    return (
        <SlidingBar visible={changesMade} className={clsx(className, "justify-between")}>
            <p className="text-xl phone:text-lg self-center">{label || "Careful - You have unsaved changes!"}</p>
            <div className="flex tablet:flex-col gap-4">
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
        </SlidingBar>
    );
}