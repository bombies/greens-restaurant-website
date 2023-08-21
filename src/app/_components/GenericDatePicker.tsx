import { FC } from "react";
import clsx from "clsx";
import GenericInput from "./inputs/GenericInput";
import { formatDate } from "../(site)/(accessible-site)/invoices/utils/invoice-utils";

interface Props {
    id: string,
    value?: Date,
    labelPlacement?: "beside" | "above",
    label?: string,
    onDateChange?: (date?: Date) => void,
    min?: Date,
    max?: Date,
    disabled?: boolean,
    isClearable?: boolean,
}

export const GenericDatePicker: FC<Props> = ({
                                                 id,
                                                 value,
                                                 label,
                                                 labelPlacement,
                                                 onDateChange,
                                                 min,
                                                 max,
                                                 disabled,
                                                 isClearable
                                             }) => {
    return (
        <div className={clsx("flex gap-6", labelPlacement === "above" && "flex-col")}>
            {label &&
                <label
                    className="default-container px-8 py-2 w-fit mx-auto uppercase text-[.75rem] tracking-tight font-semibold">{label}</label>}
            <GenericInput
                disabled={disabled}
                id={id}
                type="date"
                isClearable={isClearable}
                value={value ? formatDate(value, "-") : undefined}
                onValueChange={value => {
                    const [year, month, day] = value.split("-");
                    const parsedDate: Date | undefined = year ? new Date() : undefined;
                    parsedDate?.setFullYear(Number(year), Number(month) - 1, Number(day));
                    
                    if (onDateChange)
                        onDateChange(parsedDate);
                }}
                min={min ? formatDate(min, "-") : undefined}
                max={max ? formatDate(max, "-") : undefined}
            />
        </div>
    );
};