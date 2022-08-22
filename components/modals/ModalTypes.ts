export interface GenericModalObject {
    id: string,
    title?: string,
    description: string,
    children?: JSX.Element
}

export enum ModalActionType {
    MODAL_ADD,
    MODAL_REMOVE
}

export interface GenericModalAction {
    type: ModalActionType
}

export interface GenericModalAddAction extends GenericModalAction {
    payload: GenericModalObject
}

export interface GenericModalRemoveAction extends GenericModalAction {
    id: string
}

export const GenerateGenericModalAddAction = (id: string, description: string, title?: string, children?: JSX.Element): GenericModalAddAction => {
    return {
        type: ModalActionType.MODAL_ADD,
        payload: {
            id: id,
            description: description,
            title: title,
            children: children
        }
    }
}

export const GenerateGenericModalRemoveAction = (id: string): GenericModalRemoveAction => {
    return {
        type: ModalActionType.MODAL_ADD,
        id: id
    }
}