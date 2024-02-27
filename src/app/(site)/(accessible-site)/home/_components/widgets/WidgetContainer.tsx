import { FC, PropsWithChildren } from "react";

const WidgetContainer: FC<PropsWithChildren> = ({ children }) => {
    return (
        <div className="default-container backdrop-blur-md pt-6 px-6 pb-12 w-96 h-96 phone:w-full">
            {children}
        </div>
    )
}

export default WidgetContainer