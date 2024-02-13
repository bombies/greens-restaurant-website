"use client"

import { Autocomplete, AutocompleteProps } from "@nextui-org/react";
import { FieldErrors, UseFormRegister } from "react-hook-form";

type Props<T> = Omit<AutocompleteProps<T>, "id"> & {
    id: string,
    register?: UseFormRegister<any>;
    errors?: FieldErrors,
}

export default function GenericAutoComplete<T>({
                                                   id,
                                                   children,
                                                   classNames,
    inputProps,
                                                   listboxProps,
                                                   popoverProps,
                                                   register,
                                                   errors,
                                                   ...props
                                               }: Props<T>) {
    const defProps: Omit<AutocompleteProps<T>, "children"> = {
        ...props,
        inputProps: {
            ...inputProps,
            classNames: {
                ...inputProps?.classNames,
                label: "text-neutral-100 mb-4 text-sm font-semibold",
                inputWrapper: "!default-container !h-fit py-6 pr-3 pl-"
            }
        },
        listboxProps: {
            ...listboxProps,
            itemClasses: {
                ...listboxProps?.itemClasses,
                base: [
                    "data-[hover=true]:!bg-primary/20",
                    "data-[selectable=true]:focus:bg-primary/30",
                    "p-3",
                    listboxProps?.itemClasses?.base ?? ""
                ]
            }
        },
        popoverProps: {
            ...popoverProps,
            classNames: {
                content: "!default-container backdrop-blur-md",
                ...popoverProps?.classNames
            }
        }
    };

    return !register ? (
        <Autocomplete
            {...defProps}
        >
            {children}
        </Autocomplete>
    ) : (
        <Autocomplete
            {...register(id, { required: props.required || props.isRequired })}
            {...defProps}
        >
            {children}
        </Autocomplete>
    );
}