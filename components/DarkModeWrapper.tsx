import React from "react";
import {useSelector} from "react-redux";

interface Props extends React.PropsWithChildren {};

const DarkModeWrapper = (props: Props) => {
    // @ts-ignore
    const darkMode = useSelector(state => state.darkMode.value);

    return (
        <div className={`h-full ${darkMode ? 'dark' : ''}`}>
            {props.children}
        </div>
    )
}

export default DarkModeWrapper;