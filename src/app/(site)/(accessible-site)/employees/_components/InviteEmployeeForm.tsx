"use client";

import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericInput from "../../../../_components/inputs/GenericInput";
import { Spacer } from "@nextui-org/react";
import { Divider } from "@nextui-org/divider";
import GenericButton from "../../../../_components/inputs/GenericButton";
import inviteIcon from "/public/icons/invite.svg";
import SelectMenu, { SelectMenuContent } from "../../../../_components/inputs/SelectMenu";
import { useEffect, useMemo, useState } from "react";
import { Permissions } from "../../../../../libs/types/permission";
import { InviteDto } from "../../../../api/users/invite/route";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { sendToast } from "../../../../../utils/Hooks";
import checkIcon from "/public/icons/check-green-circled.svg";


const SendInvitationMail = (dto?: InviteDto) => {
    const mutator = async (url: string) => await axios.post(url, dto);
    return useSWRMutation("/api/users/invite", mutator);
};

export default function InviteEmployeeForm() {
    const {
        register,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>();
    const [permissions, setPermissions] = useState(0);
    const [inviteInfo, setInviteInfo] = useState<InviteDto>();
    const { isMutating: invitationIsSending, trigger: triggerInvitation } = SendInvitationMail(inviteInfo);

    useEffect(() => {
        if (!inviteInfo)
            return;

        triggerInvitation()
            .then(() => sendToast({
                description: "Invitation sent!",
                icon: checkIcon
            }, {
                position: 'top-center'
            }))
            .catch((err) => {
                console.error(err)
                sendToast({
                    description: "Could not send invitation!"
                }, {
                    position: 'top-center'
                })
            });
    }, [inviteInfo, triggerInvitation]);

    const selectionMenuContent = useMemo<SelectMenuContent[]>(() => {
        return Permissions.map<SelectMenuContent>(permission => ({
            label: permission.label,
            value: permission.value.toString()
        }));

    }, []);

    const submitHandler: SubmitHandler<FieldValues> = (data) => {
        const inviteData: InviteDto = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.newEmail,
            username: data.newUsername,
            permissions
        };

        setInviteInfo(inviteData);
    };

    return (
        <form onSubmit={handleSubmit(submitHandler)}>
            <div className="flex phone:flex-col gap-6">
                <GenericInput
                    disabled={invitationIsSending}
                    id="firstName"
                    label="First Name"
                    register={register}
                    required={true}
                    errors={errors}
                />
                <GenericInput
                    disabled={invitationIsSending}
                    id="lastName"
                    label="Last Name"
                    register={register}
                    required={true}
                    errors={errors}
                />
            </div>
            <Spacer y={6} />
            <GenericInput
                disabled={invitationIsSending}
                id="newEmail"
                label="Email"
                register={register}
                required={true}
                type="email"
                errors={errors}
            />
            <Spacer y={6} />
            <GenericInput
                disabled={invitationIsSending}
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
                disabled={invitationIsSending}
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
                loading={invitationIsSending}
                disabled={invitationIsSending}
                icon={inviteIcon}
                type="submit"
            >
                Invite
            </GenericButton>
        </form>
    );
}