import React, {
    MouseEventHandler,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import Image from "next/image";
import { ButtonType } from "../../types/ButtonType";
import Spinner from "../Spinner";
import { useSelector } from "react-redux";
import { sendNotification } from "../../utils/GeneralUtils";
import { NotificationContext } from "../notifications/NotificationProvider";
import { NotificationType } from "../../types/NotificationType";

interface Props extends React.PropsWithChildren {
    label?: string;
    icon?: string;
    onClick?: MouseEventHandler<HTMLDivElement>;
    isDisabled?: boolean;
    isWorking?: boolean;
    submitButton?: boolean;
    width?: number;
    height?: number;
    type: ButtonType;
    className?: string;
}

const Button = (props: Props) => {
    let buttonType: string;
    switch (props.type) {
        case ButtonType.PRIMARY: {
            buttonType = "bg-green-500 text-white";
            break;
        }
        case ButtonType.SECONDARY: {
            buttonType =
                "border-green-500 border-[1px] border-solid text-green-500";
            break;
        }
        case ButtonType.DANGER: {
            buttonType = "bg-red-500 text-white";
            break;
        }
        case ButtonType.DANGER_SECONDARY: {
            buttonType =
                "border-red-500 border-[1px] border-solid text-red-500";
            break;
        }
        case ButtonType.WARNING: {
            buttonType = "bg-amber-600 text-white";
            break;
        }
    }

    // @ts-ignore
    const darkMode = useSelector((state) => state.darkMode.value);
    const dispatchNotification = useContext(NotificationContext);
    const [showDropDown, setShowDropDown] = useState(false);
    const toggleShowDropDown = () => {
        setShowDropDown((prev) => !prev);
    };
    
    const dropDownRef = useRef(null);
    const buttonRef = useRef(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // @ts-ignore
            if (dropDownRef.current && !dropDownRef.current.contains(event.target))
                setShowDropDown(false);
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [dropDownRef])

    return (
        <div className={`${props.className || ''} relative`} ref={buttonRef}>
            {props.submitButton ? (
                props.isWorking ? (
                    <div
                        className={`${
                            props.isDisabled
                                ? "cursor-not-allowed brightness-75"
                                : "cursor-pointer hover:scale-105 "
                        } 
                rounded-xl text-lg p-2 ${buttonType} flex justify-center transition-faster shadow-md`}
                        style={{
                            width: `${props.width || 12}rem`,
                            height: `${props.height || 4}rem`,
                        }}
                    >
                        <button className="pointer-events-none">
                            <Spinner size={1.25} />
                        </button>
                    </div>
                ) : (
                    <input
                        type="submit"
                        className={`${
                            props.isDisabled
                                ? "cursor-not-allowed brightness-75"
                                : "cursor-pointer hover:scale-105 "
                        } 
                        rounded-xl text-lg p-4 ${buttonType} flex justify-center transition-faster shadow-md`}
                        onClick={props.isDisabled ? () => {} : undefined}
                        disabled={props.isDisabled}
                        style={{
                            width: `${props.width || 11}rem`,
                            height: `${props.height || 4}rem`,
                        }}
                    />
                )
            ) : (
                <div
                    onClick={
                        props.isDisabled === true
                            ? () => {}
                            : props.children
                            ? () => {
                                  toggleShowDropDown();
                              }
                            : props.onClick
                    }
                    className={`${
                        props.isDisabled
                            ? "cursor-not-allowed brightness-75"
                            : "cursor-pointer hover:scale-105 "
                    } 
                rounded-xl text-lg p-2 ${buttonType} flex justify-center transition-faster shadow-md`}
                    style={{
                        width: `${props.width || 12}rem`,
                        height: `${props.height || 4}rem`,
                    }}
                >
                    <button className="pointer-events-none">
                        {props.isWorking !== true ? (
                            <div className="flex gap-2">
                                {props.icon && (
                                    <div className="relative h-5 w-5 self-center">
                                        <Image
                                            src={props.icon}
                                            alt=""
                                            fill={true}
                                        />
                                    </div>
                                )}
                                {props.label && (
                                    <p className="self-center pointer-events-none">
                                        {props.label}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <Spinner size={1.25} />
                        )}
                    </button>
                </div>
            )}
            <div
                className={`transition-faster ${darkMode ? "bg-neutral-800" : "bg-neutral-50"} ${
                    showDropDown ? "opacity-100 visible" : "opacity-0 invisible"
                } border-[1px] border-green-400/20 shadow-md mt-1.5 rounded-lg py-4 absolute right-[-10px] z-10 w-32`}
                ref={dropDownRef}
            >
                {props.children}
            </div>
        </div>
    );
};

export default Button;
