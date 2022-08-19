type Props = {
    location?: 'tr' | 'tl' | 'br' | 'bl',
    maxNotifications?: number
}

const NotificationTray = (props: Props) => {
    let pos: string;
    switch (props.location || 'tl') {
        case 'tr': {
            break;
        }
        case 'tl': {
            break;
        }
        case 'br': {
            break;
        }
        case 'bl': {
            break;
        }
    }

    return (
        <div className={`absolute`}>

        </div>
    )
}

export default NotificationTray;