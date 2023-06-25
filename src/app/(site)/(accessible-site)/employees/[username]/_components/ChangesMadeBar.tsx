"use client";

import { CSSTransition } from "react-transition-group";
import { useRef } from "react";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import saveIcon from "/public/icons/save.svg";
import trashIcon from "/public/icons/trash.svg";

type Props = {
    changesMade: boolean,
    isChanging: boolean,
    onAccept: () => void,
    onReject: () => void,
}

export default function ChangesMadeBar({ changesMade, onAccept, onReject, isChanging }: Props) {
    const nodeRef = useRef(null);

    return (
        <div className="fixed flex z-[200] pointer-events-none justify-center top-0 left-0 w-full h-full">
            <CSSTransition
                nodeRef={nodeRef}
                in={changesMade}
                timeout={500}
                classNames="changes-made"
                unmountOnExit
            >
                <div
                    ref={nodeRef}
                    className="flex gap-12 tablet:gap-4 absolute pointer-events-auto bottom-5 default-container p-12 backdrop-blur-md"
                >
                    <p className="text-xl phone:text-lg self-center">Careful - You have unsaved changes!</p>
                    <div className="flex tablet:flex-col gap-4">
                        <GenericButton
                            shadow
                            onClick={() => onAccept()}
                            disabled={!changesMade || isChanging}
                            loading={isChanging}
                            icon={saveIcon}
                        >
                            Save
                        </GenericButton>
                        <GenericButton
                            color="danger"
                            shadow
                            onClick={() => onReject()}
                            disabled={!changesMade || isChanging}
                            icon={trashIcon}
                        >
                            Discard
                        </GenericButton>
                    </div>
                </div>
            </CSSTransition>
        </div>


    );
}