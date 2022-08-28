import {Dispatch} from "react";
import {GenerateNotificationAddAction, NotificationAddAction} from "../components/notifications/NotificationTypes";
import {v4} from "uuid";
import {NotificationType} from "../types/NotificationType";
import {toggleSidebarState} from "./redux/SidebarSlice";
import SidebarItem from "../components/sidebar/SidebarItem";
import Sidebar from "../components/sidebar/Sidebar";
import {AnyAction} from "redux";
import {
    GenerateGenericModalAddAction,
    GenerateGenericModalRemoveAction,
    GenericModalAddAction, GenericModalRemoveAction
} from "../components/modals/ModalTypes";

export const handleAxiosError = (dispatchNotification: Dispatch<NotificationAddAction> | null, err: any) => {
    const errMsg = err.response.data.error;

    if (!errMsg)
        console.error(err);
    if (dispatchNotification)
        dispatchNotification(GenerateNotificationAddAction(
            v4(),
            NotificationType.ERROR,
            errMsg || 'There was an error adding a new category. Check console for more details.'
        ));
}

export const sendNotification = (dispatchNotification: Dispatch<NotificationAddAction> | null, type: NotificationType, description: string, title?: string) => {
    if (dispatchNotification)
        dispatchNotification(GenerateNotificationAddAction(
            v4(),
            type,
            description,
            title
        ))
}

export const sendModal = (dispatchModal: Dispatch<GenericModalAddAction> | null, modalID: string, modalTitle: string, modalDescription: string, content?: JSX.Element) => {
    if (dispatchModal)
        dispatchModal(GenerateGenericModalAddAction(
            modalID,
            modalDescription,
            modalTitle,
            content
        ))
}

export const removeModal = (dispatchModal: Dispatch<GenericModalRemoveAction> | null, modalID: string) => {
    if (dispatchModal)
        dispatchModal(GenerateGenericModalRemoveAction(modalID));
}

export const generateDefaultSidebar = (sidebarOpened: boolean, reduxDispatch: Dispatch<AnyAction>) => {
    return (
        <Sidebar
            icon='https://i.imgur.com/HLTQ78m.png'
            color='bg-green-600 dark:bg-green-700'
            sidebarOpened={sidebarOpened}
            toggleSidebar={() => reduxDispatch(toggleSidebarState())}
        >
            <SidebarItem icon='https://i.imgur.com/wZ8e1Lc.png' label='Inventory' link='inventory' sidebarOpened={sidebarOpened} />
            <SidebarItem icon='https://i.imgur.com/nWxboHU.png' label='Employees' link='employees' sidebarOpened={sidebarOpened} />
            <SidebarItem icon='https://i.imgur.com/no6wh9w.png' label='Management' link='management' sidebarOpened={sidebarOpened} />
        </Sidebar>
    )
}