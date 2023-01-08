import React, {createContext, useReducer} from "react";
import {
    GenericModalAction,
    GenericModalAddAction,
    GenericModalObject,
    GenericModalRemoveAction,
    ModalActionType
} from "./ModalTypes";
import GenericModal from "./GenericModal";

export const ModalContext = createContext<React.Dispatch<GenericModalAddAction | GenericModalRemoveAction> | null>(null);

interface Props extends React.PropsWithChildren {};

const ModalProvider = (props: Props) => {
    const modalReducer = (state: GenericModalObject, action: GenericModalAction): GenericModalObject | null => {
        switch (action.type) {
            case ModalActionType.MODAL_ADD: {
                const addAction = action as GenericModalAddAction;
                return addAction.payload;
            }
            case ModalActionType.MODAL_REMOVE: {
                return null;
            }
            default: {
                return state;
            }
        }
    }

    // @ts-ignore
    const [ state, dispatch ] = useReducer(modalReducer, null);

    return (
        <ModalContext.Provider value={dispatch} >
            {
                state && <GenericModal {...state} dispatchModalRemoval={dispatch} />
            }
            {props.children}
        </ModalContext.Provider>
    )
}

export default ModalProvider;