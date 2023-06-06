import Image from "next/image";
import { useSelector } from "react-redux";

type Props = {
    opacity?: number,
    size: number,
}

const Spinner = (props: Props) => {
    // @ts-ignore
    const darkMode = useSelector(state => state.darkMode.value);

    return (
        <div className='animate-spin relative' style={{
            width: `${props.size}rem`,
            height: `${props.size}rem`,
            opacity: `${props.opacity || 100}%`,
            filter: `brightness(${darkMode ? 100 : 90}%)`
        }}>
            <Image src='https://i.imgur.com/oQkKuvH.png' alt='' fill={true} />
        </div>
    )
}

export default Spinner;