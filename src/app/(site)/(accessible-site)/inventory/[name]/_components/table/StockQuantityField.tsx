"use client";

import { StockSnapshot } from "@prisma/client";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import GenericInput from "../../../../../../_components/inputs/GenericInput";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import clsx from "clsx";
import { CSSTransition } from "react-transition-group";

type Props = {
    stock: StockSnapshot,
    disabled?: boolean,
    submitHandler: (data: { quantity: number }, setEditMode: Dispatch<SetStateAction<boolean>>) => void,
}

export default function StockQuantityField({ stock, submitHandler, disabled }: Props) {
    const [editMode, setEditMode] = useState(false);
    const { register, handleSubmit } = useForm<FieldValues>();
    const formRef = useRef<any>(null);

    useEffect(() => {
        const handle = (event: MouseEvent) => {
            if (formRef.current && (!formRef.current?.contains(event.target)) && editMode)
                setEditMode(false);
        };

        document.addEventListener("mousedown", handle);
        return () => {
            document.removeEventListener("mousedown", handle);
        };
    }, [editMode, formRef]);

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        submitHandler(data as { quantity: number }, setEditMode);
    };

    return (
        <div className="flex transition-fast w-fit">
            <CSSTransition
                in={!editMode}
                timeout={200}
                unmountOnExit
                classNames="stock-quantity-value"
            >
                <p className={clsx(
                    "cursor-pointer border-2 border-neutral-800/0 hover:default-container transition-fast w-fit py-3 px-5 rounded-2xl"
                )}
                   onClick={() => {
                       if (disabled)
                           return;
                       setEditMode(true);
                   }}>
                    {stock.quantity}
                </p>
            </CSSTransition>
            <CSSTransition
                in={editMode}
                timeout={350}
                unmountOnExit
                classNames="stock-quantity-value"
            >
                <form
                    className={clsx(
                        "w-fit"
                    )}
                    ref={formRef}
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <GenericInput
                        isDisabled={disabled}
                        register={register}
                        label="New Quantity"
                        placeholder="Enter a new quantity"
                        id="quantity"
                        type="number"
                        isRequired={true}
                    />
                </form>
            </CSSTransition>
        </div>
    );
}