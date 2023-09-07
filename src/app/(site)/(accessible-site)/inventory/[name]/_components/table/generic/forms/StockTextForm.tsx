"use client";

import { FC, ReactNode, useCallback, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericInput from "../../../../../../../../_components/inputs/GenericInput";
import { Spacer } from "@nextui-org/react";
import GenericButton from "../../../../../../../../_components/inputs/GenericButton";
import { toast } from "react-hot-toast";

type Props = {
    onTextSubmit: (text: string) => Promise<void>,
    disabled?: boolean,
    isWorking?: boolean,
    buttonLabel: string,
    buttonIcon?: ReactNode,
    defaultValue?: string,
    validate?: {
        test: (text: string) => boolean,
        failMessage?: string,
    }
    form: {
        label: string,

    }
}

const StockTextForm: FC<Props> = ({
                                      onTextSubmit,
                                      isWorking,
                                      disabled,
                                      buttonIcon,
                                      buttonLabel,
                                      defaultValue,
                                      form,
                                      validate
                                  }) => {
    const [currentText, setCurrentText] = useState<string | undefined>(defaultValue);
    const {
        register,
        handleSubmit,
        formState: {
            errors
        },
        reset
    } = useForm<FieldValues>();

    const onSubmit: SubmitHandler<FieldValues> = useCallback((data) => {
        let { text } = data;

        if (validate && !validate.test(text)) {
            toast.error(validate.failMessage ?? "Invalid data!");
            return;
        }

        onTextSubmit(text)
            .then(() => reset());
    }, [onTextSubmit, reset, validate]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <GenericInput
                isDisabled={disabled || isWorking}
                register={register}
                errors={errors}
                id="text"
                label={form.label}
                value={currentText}
                onValueChange={setCurrentText}
                placeholder="Enter something..."
                isRequired={true}
            />
            <Spacer y={6} />
            <GenericButton
                disabled={disabled || isWorking}
                isLoading={isWorking}
                type="submit"
                variant="flat"
                startContent={buttonIcon}
                className="capitalize"
            >
                {buttonLabel}
            </GenericButton>
        </form>
    );
};

export default StockTextForm;