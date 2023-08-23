import { Select, SelectProps } from "@nextui-org/react";

type Props<T> = SelectProps<T>

export default function GenericSelectMenu<T>({
                                                 children,
                                                 classNames,
                                                 listboxProps,
                                                 popoverProps,
                                                 ...props
                                             }: Props<T>) {
    return (
        <Select
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
        >
            {children}
        </Select>
    );
};