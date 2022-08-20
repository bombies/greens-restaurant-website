import React from "react";

interface Props extends React.PropsWithChildren {
    location?: 'left' | 'right'
}

const NotificationTray = (props: Props) => {
    let pos: string;
    switch (props.location || 'right') {
        case 'left': {
            pos = 'left-5';
            break;
        }
        case 'right': {
            pos = 'right-5';
            break;
        }
    }

    return (
        <div className={`absolute top-5 ${pos} w-96 h-screen z-50 flex flex-col gap-4`}>
            {props.children}
        </div>
    )
}

export default NotificationTray;