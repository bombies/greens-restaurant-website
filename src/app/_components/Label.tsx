import clsx from "clsx";
import { DetailedHTMLProps, FC, LabelHTMLAttributes } from "react";

const Label: FC<DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>> = ({ className, children, ...labelProps }) => {
    return (
        <label
            {...labelProps}
            className={
                clsx(
                    className
                )
            }>
            {children}
        </label>
    )
}

export default Label