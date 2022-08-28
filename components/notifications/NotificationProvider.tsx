import React, {createContext, useReducer} from "react";
import Notification, {NotificationProps} from "./Notification";
import {
    NotificationAction,
    NotificationActionType,
    NotificationAddAction, NotificationObject,
    NotificationRemoveAction
} from "./NotificationTypes";

export const NotificationContext = createContext<React.Dispatch<NotificationAddAction> | null>(null);

interface Props extends React.PropsWithChildren {};

const NotificationProvider = (props: Props) => {
    const notificationReducer = (state: NotificationObject[], action: NotificationAction ): NotificationObject[] => {
        switch (action.type) {
            case NotificationActionType.NOTIFICATION_ADD: {
                const addAction = action as NotificationAddAction;
                return [...state, {...addAction.payload}];
            }
            case NotificationActionType.NOTIFICATION_REMOVE: {
                const removeAction = action as NotificationRemoveAction;
                return state.filter(e => e.id !== removeAction.id);
            }
            default: {
                return state;
            }
        }
    }

    // @ts-ignore
    const [ state, dispatch ] = useReducer(notificationReducer, []);

    return (
        <NotificationContext.Provider value={dispatch}>
            {/*Notification Wrapper*/}
            <div className='z-[200] fixed right-10 top-10 w-96'>
                {state.map(notification => {
                    return <Notification key={notification.id} dispatch={dispatch} {...notification} />
                })}
            </div>
            {props.children}
        </NotificationContext.Provider>
    )
};

export default NotificationProvider;