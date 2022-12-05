import Image from "next/image";

type Props = {
    opacity?: number,
    brightness?: number,
    size: number,
}

const Spinner = (props: Props) => {
    return (
        <div className='animate-spin relative' style={{
            width: `${props.size}rem`,
            height: `${props.size}rem`,
            opacity: `${props.opacity || 100}%`,
            filter: `brightness(${props.brightness || 100}%)`
        }}>
            <Image src='https://i.imgur.com/oQkKuvH.png' alt='' fill={true} />
        </div>
    )
}

export default Spinner;