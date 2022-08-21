import {NotificationType} from "../../types/NotificationType";
import React, {useEffect, useState} from "react";
import {NotificationAction, NotificationActionType, NotificationRemoveAction} from "./NotificationTypes";
import Image from "next/image";

export type NotificationProps = {
    id: string
    type: NotificationType,
    title?: string,
    description: string
    dispatch: React.Dispatch<NotificationRemoveAction>
}

const Notification = (props: NotificationProps) => {
    let typeObject;
    switch (props.type) {
        case NotificationType.INFO: {
            typeObject = {
                title: 'Note',
                icon: 'https://i.imgur.com/OKylpdO.png',
                color: 'bg-neutral-300',
                barColor: 'bg-neutral-600'
            }
            break;
        }
        case NotificationType.SUCCESS: {
            typeObject = {
                title: 'Success',
                icon: 'https://i.imgur.com/5YS430G.png',
                color: 'bg-green-500',
                barColor: 'bg-green-700'
            }
            break;
        }
        case NotificationType.ERROR: {
            typeObject = {
                title: 'Error',
                icon: 'https://i.imgur.com/gAMSFoG.png',
                color: 'bg-red-500',
                barColor: 'bg-red-700'
            }
            break;
        }
        case NotificationType.WARNING: {
            typeObject = {
                title: 'Warning',
                icon: 'https://i.imgur.com/gGwEe5j.png',
                color: 'bg-amber-500',
                barColor: 'bg-amber-400'
            }
            break;
        }
    }

    const [ exit, setExit ] = useState(false);
    const [ progress, setProgress ] = useState(0);
    const [ intervalState, setIntervalState ] = useState(null);

    const handleStartProgressTimer = () => {
        const interval = setInterval(() => {
            // @ts-ignore
            setProgress((prev) => {
                if (prev < 100)
                    return prev + 0.25;
                clearInterval(interval);
                return prev;
            })
        }, 20);
        // @ts-ignore
        setIntervalState(interval);
    };

    const handlePauseProgressTimer = () => {
        // @ts-ignore
        clearInterval(intervalState);
    };

    const handleCloseNotification = () => {
        handlePauseProgressTimer();
        setExit(true);
        setTimeout(() => {
            props.dispatch({
                type: NotificationActionType.NOTIFICATION_REMOVE,
                id: props.id
            })
            // Remove state and therefore the dom
        }, 400);
    };

    useEffect(() => {
        if (progress === 100)
            handleCloseNotification();
    }, [progress]);

    useEffect(() => {
        handleStartProgressTimer();
    }, []);

    return (
        <div
            className={`bg-opacity-30 p-4 mb-5 w-full bg-backdrop-blur-xl ${typeObject.color} rounded-md shadow-md animate-slide-left ${exit ? 'animate-slide-right' : ''}`}
            onMouseEnter={handlePauseProgressTimer}
            onMouseLeave={handleStartProgressTimer}
        >
            <div className='flex gap-2'>
                <div className='relative w-6 h-6 self-center'>
                    <Image src={typeObject.icon} alt='' layout='fill' />
                </div>
                <h3 className='font-medium tracking-wider text-xl'>{props.title || typeObject.title}</h3>
            </div>
            <p className='mb-4'>{props.description}</p>
            <div className={`h-1 rounded-full ${typeObject.barColor}`} style={{ width: `${progress}%`}}></div>
        </div>
    )
}

export default Notification