import {NotificationType} from "../../types/NotificationType";

export type NotificationObject = {
    id: string
    type: NotificationType,
    title?: string,
    description: string
}

export enum NotificationActionType {
    NOTIFICATION_ADD,
    NOTIFICATION_REMOVE
}

export interface NotificationAction {
    type: NotificationActionType
}

export interface NotificationAddAction extends NotificationAction {
    payload: NotificationObject
}

export interface NotificationRemoveAction extends NotificationAction {
    id: string
}

export const GenerateNotificationAddAction = (id: string, type: NotificationType, description: string, title?: string): NotificationAddAction => {
    return {
        type: NotificationActionType.NOTIFICATION_ADD,
        payload: {
            id: id,
            type: type,
            description: description,
            title: title
        }
    }
}


