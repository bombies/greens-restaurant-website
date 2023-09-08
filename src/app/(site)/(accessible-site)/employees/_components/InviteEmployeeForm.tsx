"use client";

import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericInput from "../../../../_components/inputs/GenericInput";
import { Checkbox, CheckboxGroup, Spacer } from "@nextui-org/react";
import { Divider } from "@nextui-org/divider";
import GenericButton from "../../../../_components/inputs/GenericButton";
import inviteIcon from "/public/icons/invite.svg";
import { Dispatch, SetStateAction, useState } from "react";
import { Permission, Permissions } from "../../../../../libs/types/permission";
import { InviteDto } from "../../../../api/users/invite/route";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { errorToast } from "../../../../../utils/Hooks";
import { toast } from "react-hot-toast";
import { KeyedMutator } from "swr";
import { User } from "@prisma/client";


type SendInvitationMailArgs = {
    arg: {
        dto?: InviteDto
    }
}

const SendInvitationMail = () => {
    const mutator = async (url: string, {arg}: SendInvitationMailArgs) => await axios.post(url, arg.dto);
    return useSWRMutation("/api/users/invite", mutator);
};

type Props = {
    setModalVisible: Dispatch<SetStateAction<boolean>>
    userHasPermission: boolean,
    employees: User[]
    mutateEmployees: KeyedMutator<User[] | undefined>
}

export default function InviteEmployeeForm({ setModalVisible, userHasPermission, employees, mutateEmployees }: Props) {
    const {
        register,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>();
    const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>();
    const { isMutating: invitationIsSending, trigger: triggerInvitation } = SendInvitationMail();

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
        triggerInvitation({
            dto: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.newEmail,
                username: data.newUsername,
                permissions: selectedPermissions?.reduce((acc, next) => acc + next) ?? 0
            }
        })
            .then(async (res) => {
                const user: User = res.data;
                const newArr = [...employees, user];
                await mutateEmployees(newArr);
                toast.success("Invitation sent!");
                setModalVisible(false);
            })
            .catch((err) => {
                console.error(err);
                errorToast(err, "Could not send invitation!");
            });
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
                <div className="grid grid-cols-2 phone:grid-cols-1">
                    {permissionCheckBoxes}
                </div>
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