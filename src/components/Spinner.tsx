import Image from "next/image";
import { useSelector } from "react-redux";
import { useDarkMode } from "../app/_components/DarkModeProvider";

type Props = {
    opacity?: number,
    size: number,
}

const Spinner = (props: Props) => {
    const [darkMode] = useDarkMode();

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