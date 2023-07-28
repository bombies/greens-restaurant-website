"use client";

import GenericButton from "../../../../../_components/inputs/GenericButton";
import saveIcon from "/public/icons/save.svg";
import trashIcon from "/public/icons/trash.svg";
import SlidingBar from "../../../../../_components/SlidingBar";

type Props = {
    changesMade: boolean,
    isChanging: boolean,
    onAccept: () => void,
    onReject: () => void,
}

export default function ChangesMadeBar({ changesMade, onAccept, onReject, isChanging }: Props) {
    return (
        <SlidingBar visible={changesMade} className="justify-between">
            <p className="text-xl phone:text-lg self-center">Careful - You have unsaved changes!</p>
            <div className="flex tablet:flex-col gap-4">
                <GenericButton
                    onPress={() => onAccept()}
                    disabled={!changesMade || isChanging}
                    isLoading={isChanging}
                    icon={saveIcon}
                >
                    Save
                </GenericButton>
                <GenericButton
                    color="danger"
                    onPress={() => onReject()}
                    disabled={!changesMade || isChanging}
                    icon={trashIcon}
                >
                    Discard
                </GenericButton>
            </div>
        </SlidingBar>
    );
}