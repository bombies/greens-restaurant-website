import { cn } from "@nextui-org/react";
import { FC, PropsWithChildren } from "react";

type Props = PropsWithChildren<{
    className?: string,
}>

const Container: FC<Props> = ({ className, children }) => {
    return (
        <div className={
            cn(
                "default-container p-6 phone:px-4",
                className
            )
        }>
            {children}
        </div>
    )
}

export default Container