import { FC } from "react";
import { Tabs, TabsProps } from "@nextui-org/react";

type Props = TabsProps

const GenericTabs: FC<TabsProps> = ({ children, classNames, ...props }) => {
    return (
        <Tabs
            classNames={{
                tabList: "!default-container p-4",
                cursor: "!bg-primary/50 rounded-xl",
                tabContent: "uppercase font-semibold text-xs px-4",
                ...classNames
            }}
            {...props}
        >
            {children}
        </Tabs>
    );
};

export default GenericTabs;