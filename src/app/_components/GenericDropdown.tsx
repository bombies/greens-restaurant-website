import { FC, Key, ReactNode } from "react";
import { Dropdown, DropdownMenu, DropdownMenuProps, DropdownProps, DropdownTrigger } from "@nextui-org/react";
import { CollectionChildren } from "@react-types/shared";

type Props = Omit<DropdownProps, "children" | "trigger"> & {
    trigger: ReactNode,
    children: CollectionChildren<any>,
    onAction?: (key: Key) => void,
    menuProps?: Omit<DropdownMenuProps, "children">
}

const GenericDropdown: FC<Props> = ({ trigger, children, onAction, menuProps, ...props }) => {
    return (
        <Dropdown
            {...props}
            classNames={{
                base: "bg-neutral-900/80 backdrop-blur-md border-1 border-white/20 p-6",
                ...props.classNames
            }}
        >
            <DropdownTrigger>
                {trigger}
            </DropdownTrigger>
            <DropdownMenu
                onAction={onAction}
                {...menuProps}
            >
                {children}
            </DropdownMenu>
        </Dropdown>
    );
};

export default GenericDropdown;