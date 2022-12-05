import React from "react";
import {GenerateGenericModalRemoveAction, GenericModalObject, GenericModalRemoveAction} from "./ModalTypes";
import Image from "next/image";
import {useSelector} from "react-redux";

interface Props extends GenericModalObject {
    dispatchModalRemoval: React.Dispatch<GenericModalRemoveAction>
}

const GenericModal = (props: Props) => {
    // @ts-ignore
    const darkMode = useSelector(state => state.darkMode.value);

    return (
        <div className='fixed z-50 bg-neutral-800 bg-opacity-50 w-full h-full flex items-center'>
            <div className='absolute w-3/4 min-h-fit bg-white dark:bg-neutral-900 rounded-xl py-12 px-6 left-0 right-0 mx-auto'>
                <div
                    className={'absolute right-4 top-4 w-5 h-5 cursor-pointer opacity-25 hover:opacity-100 transition-faster'}
                    onClick={() => {
                        if (!props.dispatchModalRemoval)
                            return;
                        props.dispatchModalRemoval(GenerateGenericModalRemoveAction(props.id));
                    }}
                >
                    <Image src={darkMode ? 'https://i.imgur.com/qNlanxv.png' : 'https://i.imgur.com/tl7Zktf.png'} alt='' fill={true} />
                </div>
                { props.title &&
                    <div>
                        <h1 className='font-bold text-4xl tracking-wider text-center mb-4 dark:text-white'>{props.title}</h1>
                        <hr className='mb-4' />
                    </div>
                }
                <p className='text-xl text-center mb-6 dark:text-white'>{props.description}</p>
                {props.children}
            </div>
        </div>
    )
}

export default GenericModal;