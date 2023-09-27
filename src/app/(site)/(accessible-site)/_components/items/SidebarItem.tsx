import { JSX, MouseEventHandler, useMemo } from "react";
import clsx from "clsx";
import { Link, Tooltip } from "@nextui-org/react";

type SidebarItemProps = {
    label: string,
    href: string,
    icon: JSX.Element,
    onHoverEnter?: MouseEventHandler<HTMLDivElement>
    onHoverLeave?: MouseEventHandler<HTMLDivElement>,
    sidebarOpen: boolean,
}

export default function SidebarItem(props: SidebarItemProps) {
    const item = useMemo(() => (
        <Link href={props.href} className={clsx(
            "text-white",
            !props.sidebarOpen && "w-fit"
        )}>
            <div className={clsx("w-full flex gap-4 p-4 transition-fast hover:text-primary hover:bg-primary/5", !props.sidebarOpen && "rounded-lg")}
                 onMouseEnter={props.onHoverEnter}
                 onMouseLeave={props.onHoverLeave}
            >
                <div className="self-center">
                    {props.icon}
                </div>
                {props.sidebarOpen && <p className="text-medium font-normal tracking-wide self-center tablet:text-sm">{props.label}</p>}
            </div>
        </Link>
    ), [props.href, props.icon, props.label, props.onHoverEnter, props.onHoverLeave, props.sidebarOpen])
    
    return props.sidebarOpen ? item : (
        <Tooltip
            content={props.label}
            placement="right"
        >
            {item}
        </Tooltip>
    );
}