import { Select, SelectProps } from "@nextui-org/react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

type Props<T> = Omit<SelectProps<T>, "id"> & {
    id: string,
    register?: UseFormRegister<FieldValues>;
    errors?: FieldErrors,
}

export default function GenericSelectMenu<T>({
                                                 id,
                                                 children,
                                                 classNames,
                                                 listboxProps,
                                                 popoverProps,
                                                 register,
                                                 errors,
                                                 ...props
                                             }: Props<T>) {
    return !register ? (
        <Select
            {...props}
            classNames={{
                label: "text-neutral-100 mb-4 text-sm font-semibold",
                trigger: "!default-container !h-fit py-6 pr-3 pl-6",
            }}
            listboxProps={{
                itemClasses: {
                    base: [
                        "data-[hover=true]:!bg-primary/40",
                        "data-[selectable=true]:focus:bg-primary/30",
                        "p-3"
                    ]
                }
            }}
            popoverProps={{
                classNames: {
                    base: [
                        "!default-container backdrop-blur-md"
                    ]
                }
            }}
        >
            {children}
        </Select>
    ) : (
        <Select
            {...register(id, { required: props.required || props.isRequired })}
            {...props}
            classNames={{
                trigger: "!default-container !h-fit py-6 px-3"
            }}
            listboxProps={{
                itemClasses: {
                    base: [
                        "data-[hover=true]:!bg-primary/40",
                        "data-[selectable=true]:focus:bg-primary/30",
                        "p-3"
                    ]
                }
            }}
            popoverProps={{
                classNames: {
                    base: [
                        "!default-container backdrop-blur-md"
                    ]
                }
            }}
            validationState={(errors && errors[id]) && "invalid"}
        >
            {children}
        </Select>
    );
};