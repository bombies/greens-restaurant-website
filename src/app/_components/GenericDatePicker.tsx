import { FC } from "react";
import clsx from "clsx";
import GenericInput from "./inputs/GenericInput";
import { formatDate } from "../(site)/(accessible-site)/invoices/utils/invoice-utils";
import { dateInputToDateObject } from "../../utils/GeneralUtils";
import { UseFormRegister } from "react-hook-form";

interface Props {
    id: string,
    register?: UseFormRegister<any>;
    isRequired?: boolean,
    value?: Date,
    labelPlacement?: "beside" | "above",
    label?: string,
    inputLabel?: string,
    onDateChange?: (date?: Date) => void,
    min?: Date,
    max?: Date,
    isDisabled?: boolean,
    isClearable?: boolean,
}

export const GenericDatePicker: FC<Props> = ({
                                                 id,
                                                 register,
                                                 isRequired,
                                                 value,
                                                 label,
                                                 inputLabel,
                                                 labelPlacement,
                                                 onDateChange,
                                                 min,
                                                 max,
                                                 isDisabled: disabled,
                                                 isClearable
                                             }) => {
    return (
        <div className={clsx("flex gap-6", labelPlacement === "above" && "flex-col")}>
            {label &&
                <label
                    className="default-container px-8 py-2 w-fit mx-auto uppercase text-[.75rem] tracking-tight font-semibold">{label}</label>}
            <GenericInput
                register={register}
                isRequired={isRequired}
                disabled={disabled}
                label={inputLabel}
                labelPlacement={labelPlacement === "beside" ? "outside-left" : "inside"}
                id={id}
                type="date"
                placeholder={formatDate(new Date(), "-")}
                isClearable={isClearable}
                value={value ? formatDate(value, "-") : undefined}
                onValueChange={value => {
                    const parsedDate: Date | undefined = dateInputToDateObject(value);
                    if (onDateChange)
                        onDateChange(parsedDate);
                }}
                min={min ? formatDate(min, "-") : undefined}
                max={max ? formatDate(max, "-") : undefined}
            />
        </div>
    );
};