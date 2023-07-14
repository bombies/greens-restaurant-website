"use client";

import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericInput from "../../../../_components/inputs/GenericInput";
import { Checkbox, CheckboxGroup, Spacer } from "@nextui-org/react";
import { Divider } from "@nextui-org/divider";
import GenericButton from "../../../../_components/inputs/GenericButton";
import inviteIcon from "/public/icons/invite.svg";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Permission, Permissions } from "../../../../../libs/types/permission";
import { InviteDto } from "../../../../api/users/invite/route";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { sendToast } from "../../../../../utils/Hooks";
import checkIcon from "/public/icons/check-green-circled.svg";
import { useRouter } from "next/navigation";


const SendInvitationMail = (dto?: InviteDto) => {
    const mutator = async (url: string) => await axios.post(url, dto);
    return useSWRMutation("/api/users/invite", mutator);
};

type Props = {
    setModalVisible: Dispatch<SetStateAction<boolean>>
    userHasPermission: boolean,
}

export default function InviteEmployeeForm({ setModalVisible, userHasPermission }: Props) {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>();
    const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>();
    const [inviteInfo, setInviteInfo] = useState<InviteDto>();
    const { isMutating: invitationIsSending, trigger: triggerInvitation } = SendInvitationMail(inviteInfo);

    useEffect(() => {
        if (!inviteInfo || !userHasPermission)
            return;

        triggerInvitation()
            .then(() => {
                sendToast({
                    description: "Invitation sent!",
                    icon: checkIcon
                }, {
                    position: "top-center"
                });

                router.refresh();
                setModalVisible(false);
            })
            .catch((err) => {
                console.error(err);
                sendToast({
                    error: err,
                    description: "Could not send invitation!"
                }, {
                    position: "top-center"
                });
            });
    }, [inviteInfo, router, setModalVisible, triggerInvitation, userHasPermission]);

    const permissionCheckBoxes = Permissions
        .filter(permission => permission.value !== Permission.ADMINISTRATOR || (permission.value === Permission.ADMINISTRATOR && userHasPermission))
        .map(permission => (
            <Checkbox
                key={permission.value}
                value={permission.value.toString()}
            >
                {permission.label}
            </Checkbox>
        ));

    const submitHandler: SubmitHandler<FieldValues> = (data) => {
        const inviteData: InviteDto = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.newEmail,
            username: data.newUsername,
            permissions: selectedPermissions?.reduce((acc, next) => acc + next) ?? 0
        };
        setInviteInfo(inviteData);
    };

    return (
        <form onSubmit={handleSubmit(submitHandler)}>
            <div className="flex phone:flex-col gap-6">
                <GenericInput
                    disabled={invitationIsSending || !userHasPermission}
                    id="firstName"
                    label="First Name"
                    register={register}
                    isRequired
                    errors={errors}
                />
                <GenericInput
                    disabled={invitationIsSending || !userHasPermission}
                    id="lastName"
                    label="Last Name"
                    register={register}
                    isRequired
                    errors={errors}
                />
            </div>
            <Spacer y={6} />
            <GenericInput
                disabled={invitationIsSending || !userHasPermission}
                id="newEmail"
                label="Email"
                register={register}
                isRequired
                type="email"
                errors={errors}
            />
            <Spacer y={6} />
            <GenericInput
                disabled={invitationIsSending || !userHasPermission}
                id="newUsername"
                label="Username"
                register={register}
                isRequired
                errors={errors}
            />
            <Spacer y={6} />
            <CheckboxGroup
                label="Permissions"
                value={selectedPermissions?.map(permission => permission.toString())}
                onValueChange={(value: string[]) => {
                    setSelectedPermissions(value.map(permissionString => Number(permissionString)));
                }}
            >
                {permissionCheckBoxes}
            </CheckboxGroup>
            <Spacer y={6} />
            <Divider />
            <Spacer y={6} />
            <GenericButton
                isLoading={invitationIsSending}
                disabled={invitationIsSending || !userHasPermission}
                icon={inviteIcon}
                type="submit"
            >
                Invite
            </GenericButton>
        </form>
    );
}