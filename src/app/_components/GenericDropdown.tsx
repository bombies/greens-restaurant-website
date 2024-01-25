import { FC, Key, ReactNode } from "react";
import { Dropdown, DropdownMenu, DropdownMenuProps, DropdownProps, DropdownTrigger } from "@nextui-org/react";
import { CollectionChildren } from "@react-types/shared";
import clsx from "clsx";

type Props = Omit<DropdownProps, "children" | "trigger"> & {
    trigger: ReactNode,
    children: CollectionChildren<any>,
    onAction?: (key: Key) => void,
    menuProps?: Omit<DropdownMenuProps, "children">
}

const GenericDropdown: FC<Props> = ({ trigger, children, onAction, menuProps, className, ...props }) => {
    return (
        <Dropdown
            {...props}
            className={clsx("bg-neutral-900/80 backdrop-blur-md border-1 border-white/20 p-6", className)}
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