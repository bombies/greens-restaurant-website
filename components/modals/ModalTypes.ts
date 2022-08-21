export interface GenericModalObject {
    id: string,
    title?: string,
    description: string
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

export const GenerateGenericModalAddAction = (id: string, description: string, title?: string): GenericModalAddAction => {
    return {
        type: ModalActionType.MODAL_ADD,
        payload: {
            id: id,
            description: description,
            title: title
        }
    }
}

export const GenerateGenericModalRemoveAction = (id: string): GenericModalRemoveAction => {
    return {
        type: ModalActionType.MODAL_ADD,
        id: id
    }
}