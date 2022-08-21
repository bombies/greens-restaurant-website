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
    type: NotificationActionType,
    payload: NotificationObject
}

export interface NotificationRemoveAction extends NotificationAction {
    id: string
}

