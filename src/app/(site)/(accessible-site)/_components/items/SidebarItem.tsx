import { MouseEventHandler, ReactElement, useCallback, useMemo } from "react";
import clsx from "clsx";
import { Accordion, AccordionItem, Button, Link, Tooltip } from "@nextui-org/react";
import GenericPopover from "../../../../_components/GenericPopover";
import IconButton from "../../../../_components/inputs/IconButton";
import { ArrowDownIcon, ChevronsDownIcon } from "lucide-react";

type SidebarItemProps = {
    className?: string,
    label: string,
    href: string,
    icon: ReactElement,
    onHoverEnter?: MouseEventHandler<HTMLDivElement>
    onHoverLeave?: MouseEventHandler<HTMLDivElement>,
    sidebarOpen: boolean,
    subItems?: Pick<SidebarItemProps, "label" | "href" | "icon">[]
}

export default function SidebarItem({
                                        className,
                                        label,
                                        href,
                                        icon,
                                        onHoverEnter,
                                        onHoverLeave,
                                        sidebarOpen,
                                        subItems
                                    }: SidebarItemProps) {
    const subItemElements = useMemo(() => subItems?.map((item, i) =>
        <SidebarItem
            key={`${item.label}#${item.href}#${i}`}
            label={item.label}
            href={item.href}
            icon={item.icon}
            sidebarOpen={sidebarOpen}
            onHoverEnter={onHoverEnter}
            onHoverLeave={onHoverLeave}
        />
    ) ?? [], [onHoverEnter, onHoverLeave, sidebarOpen, subItems]);

    const item = useMemo(() => (
        <Link href={href} className={clsx(
            "text-white",
            !sidebarOpen && "w-fit",
            className
        )}>
            <div
                className={clsx("w-full flex gap-4 p-4 transition-fast hover:text-primary hover:bg-primary/5 rounded-xl", !sidebarOpen && "rounded-lg")}
                onMouseEnter={onHoverEnter}
                onMouseLeave={onHoverLeave}
            >
                <div className="self-center hover:text-primary">
                    {icon}
                </div>
                {sidebarOpen &&
                    <p className="text-medium font-normal tracking-wide self-center tablet:text-sm">{label}</p>}
            </div>
        </Link>
    ), [className, href, icon, label, onHoverEnter, onHoverLeave, sidebarOpen]);
    
    const finalItem = useMemo(() => (
        !subItems?.length ? item : (
            <div className="flex">
                {item}
                <GenericPopover
                    placement="right"
                    trigger={(
                        <Button
                            className="self-center"
                            isIconOnly
                            variant="light"
                            color="primary"
                            size="sm"
                        >
                            <ChevronsDownIcon width={16} />
                        </Button>
                    )}
                >
                    <div className="flex flex-col">
                        {subItemElements}
                    </div>
                </GenericPopover>
            </div>
        )
    ), [item, subItemElements, subItems?.length])

    return sidebarOpen ? finalItem : (
        <Tooltip
            className="default-container p-4 font-semibold text-lg bg-neutral-900/80 backdrop-blur-md"
            content={label}
            placement="right"
        >
            {finalItem}
        </Tooltip>
    );
}