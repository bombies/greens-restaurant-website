import { FC } from "react";
import { Tabs, TabsProps } from "@nextui-org/react";

type Props = TabsProps

const GenericTabs: FC<TabsProps> = ({ children, classNames, ...props }) => {
    return (
        <Tabs
            classNames={{
                tabList: "!default-container p-4 phone:p-2 !phone:rounded-lg",
                cursor: "!bg-primary/50 rounded-xl phone:rounded-lg",
                tabContent: "uppercase font-semibold text-xs px-4 phone:px-0 break-words",
                ...classNames
            }}
            {...props}
        >
            {children}
        </Tabs>
    );
};

export default GenericTabs;