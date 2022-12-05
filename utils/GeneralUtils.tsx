import { Dispatch, useEffect } from "react";
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
import { NextApiResponse } from "next";
import Joi from "joi";

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
            <SidebarItem icon='https://i.imgur.com/Uc4bWGn.png' label='Invoices' link='invoices' sidebarOpened={sidebarOpened} />
            <SidebarItem icon='https://i.imgur.com/no6wh9w.png' label='Management' link='management' sidebarOpened={sidebarOpened} />
        </Sidebar>
    )
}

export const objectCompare = (object1: any, object2: any) => {
    if (!object1)
        return false;
    if (!object2)
        return false;

    for (let propName in object1) {
        if (object1.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
            return false;
        } else if (typeof object1[propName] != typeof object2[propName]) {
            return false;
        }
    }

    for(let propName in object2) {
        if (object1.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
            return false;
        } else if (typeof object1[propName] != typeof object2[propName]) {
            return false;
        }

        if(!object1.hasOwnProperty(propName))
            continue;

        if (object1[propName] instanceof Array && object2[propName] instanceof Array) {
            if (!arrayCompare(object1[propName], object2[propName]))
                return false;
        }

        else if (object1[propName] instanceof Object && object2[propName] instanceof Object) {
            if (!objectCompare(object1[propName], object2[propName]))
                return false;
        }

        else if(object1[propName] != object2[propName]) {
            return false;
        }
    }
    return true;
}

export const arrayCompare = (arr1: any[], arr2: any[]) => {
    if (!arr1)
        return false;
    if (!arr2)
        return false;

    if (arr1.length != arr2.length)
        return false;

    for (let i = 0, l=arr1.length; i < l; i++) {
        if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
            if (!arrayCompare(arr1[i], arr2[i]))
                return false;
        } else if (arr1[i] instanceof Object && arr2[i] instanceof Object) {
            if (!objectCompare(arr1[i], arr2[i]))
                return false;
        } else if (arr1[i] != arr2[i]) {
            return false;
        }
    }
    return true;
}

export const handleInvalidHTTPMethod = (res: NextApiResponse, method?: string) => {
    return res.status(405).json({ error: `You cannot ${method} this route!` });
}

export const handleJoiValidation = (res: NextApiResponse, joiObj: Joi.ObjectSchema, body: Object): boolean => {
    const { error } = joiObj.validate(body)
    if (error) {
        res.status(400).json({ error: error.details[0].message });
        return false;
    }
    return true;
}