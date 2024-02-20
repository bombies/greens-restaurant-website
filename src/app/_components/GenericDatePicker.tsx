"use client"

import { FC, useMemo, useState } from "react";
import clsx from "clsx";
import { DatePickerSlotsComponentsProps, DesktopDatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";

type DefaultProps = {
    value?: Date,
    onDateChange?: (date?: Date) => void,
    isRequired?: boolean,
    labelPlacement?: "beside" | "above",
    label?: string,
    inputLabel?: string,
    min?: Date,
    max?: Date,
    isDisabled?: boolean,
}

export const GenericDatePicker: FC<DefaultProps> = ({
    isRequired,
    value,
    label,
    inputLabel,
    labelPlacement,
    onDateChange,
    min,
    max,
    isDisabled,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const styles = useMemo<DatePickerSlotsComponentsProps<any>>(() => ({
        actionBar: {
            actions: value ? ['clear', 'today'] : ['today'],
        },
        textField: {
            InputProps: {
                required: isRequired,
                classes: {
                    root: "default-container px-8 py-2 !rounded-2xl backdrop-blur-md !text-white transition-fast",
                },
                endAdornment: (
                    <>
                        <CalendarIcon
                            width={36}
                            className="cursor-pointer hover:bg-primary/20 rounded-lg py-1 transition-colors hover:text-primary"
                            onClick={() => setIsOpen(true)}
                        />
                    </>
                )
            }
        },
        layout: {
            classes: {
                contentWrapper: "!bg-transparent !rounded-2xl",
                root: "default-container px-8 py-2 !rounded-2xl backdrop-blur-md !text-white transition-fast",
            },
            sx: {
                "& .Mui-disabled": {
                    color: "white !important",
                    opacity: 0.5,
                },
                "& .MuiPickersArrowSwitcher-button": {
                    color: "white"
                },
                "& .MuiPickersCalendarHeader-switchViewIcon": {
                    color: "white"
                },
                "& .MuiDayCalendar-weekDayLabel": {
                    color: "#00D61580"
                },
                "& .MuiDayCalendar-weekNumber": {
                    color: "#00D61580"
                },
                "& .MuiPickersDay-root": {
                    color: "white",
                    borderRadius: "8px",
                    "&:hover": {
                        backgroundColor: "#00D61510 !important"
                    }
                },
                "& .MuiPickersDay-today": {
                    color: "white",
                    backgroundColor: "#FFFFFF10 !important",
                    borderRadius: "8px"
                },
                "& .Mui-selected": {
                    color: "white",
                    borderRadius: "8px",
                    backgroundColor: "#00D61540 !important"
                },
            }
        }
    }), [isRequired, value])

    return (
        <div className={clsx("flex gap-6", labelPlacement === "above" && "flex-col")}>
            {label &&
                <label
                    className="default-container px-8 py-2 w-fit mx-auto uppercase text-[.75rem] tracking-tight font-semibold">{label}</label>}
            <DesktopDatePicker
                open={isOpen}
                onClose={() => setIsOpen(false)}
                label={inputLabel}
                value={value && dayjs(value)}
                onChange={(date) => onDateChange && onDateChange(date?.toDate())}
                minDate={min && dayjs(min)}
                maxDate={max && dayjs(max)}
                slotProps={styles}
                disabled={isDisabled}
                views={["year", "month", "day"]}
            />
        </div>
    );
};