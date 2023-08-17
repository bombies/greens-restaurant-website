import { FC } from "react";
import clsx from "clsx";
import GenericInput from "./inputs/GenericInput";
import { formatDate } from "../(site)/(accessible-site)/invoices/components/invoice-utils";

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
                    if (onDateChange)
                        onDateChange(value ? new Date(value) : undefined);
                }}
                min={min ? formatDate(min, "-") : undefined}
                max={max ? formatDate(max, "-") : undefined}
            />
        </div>
    );
};