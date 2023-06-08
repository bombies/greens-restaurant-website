"use client";

import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericInput from "../../../../_components/inputs/GenericInput";
import { Spacer } from "@nextui-org/react";
import { Divider } from "@nextui-org/divider";
import GenericButton from "../../../../_components/inputs/GenericButton";
import inviteIcon from "/public/icons/invite.svg";
import SelectMenu, { SelectMenuContent } from "../../../../_components/inputs/SelectMenu";
import { useMemo, useState } from "react";
import { Permissions } from "../../../../../libs/types/permission";
import { Simulate } from "react-dom/test-utils";
import error = Simulate.error;

export default function InviteEmployeeForm() {
    const {
        register, handleSubmit, formState: {
            errors
        }
    } = useForm<FieldValues>();
    const [permissions, setPermissions] = useState(0);

    const selectionMenuContent = useMemo<SelectMenuContent[]>(() => {
        return Permissions.map<SelectMenuContent>(permission => ({
            label: permission.label,
            value: permission.value
        }));

    }, []);

    const submitHandler: SubmitHandler<FieldValues> = (data) => {
        console.log(data, permissions);
        console.log(errors);
    };

    return (
        <form onSubmit={handleSubmit(submitHandler)}>
            <GenericInput
                id="newEmail"
                label="Email"
                register={register}
                required={true}
                type="email"
                errors={errors}
            />
            <Spacer y={6} />
            <GenericInput
                id="newUsername"
                label="Username"
                register={register}
                required={true}
                errors={errors}
            />
            <Spacer y={6} />
            <p className="mb-[.5rem]">Permissions</p>
            <SelectMenu
                fullWidth
                multiSelect
                displayCategories={false}
                handleItemSelect={item => {
                    setPermissions(prev => prev + Number(item.value));
                }}
                handleItemDeselect={item => {
                    setPermissions(prev => prev - Number(item.value));
                }}
                content={selectionMenuContent}

            />
            <Spacer y={6} />
            <Divider />
            <Spacer y={6} />
            <GenericButton
                shadow
                icon={inviteIcon}
                type="submit"
            >
                Invite
            </GenericButton>
        </form>
    );
}