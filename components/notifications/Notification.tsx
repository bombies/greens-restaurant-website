import Image from "next/image";

type Props = {
    type: 'info' | 'warning' | 'error',
    description: string
}

const Notification = (props: Props) => {
    let icon: string, title: string;

    return (
        <div className='rounded-lg relative w-full h-16 bg-blue-500'>
            <div>
                <div className='relative w-6 h-6'>
                    <Image src='' alt='' layout='fill' />
                </div>
                <h3></h3>
            </div>
            <p>{props.description}</p>
        </div>
    )
}

export default Notification;