"use client";

import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericInput from "../../../../_components/inputs/GenericInput";
import { Spacer } from "@nextui-org/react";
import { Divider } from "@nextui-org/divider";
import GenericButton from "../../../../_components/inputs/GenericButton";
import inviteIcon from "/public/icons/invite.svg";
import SelectMenu, { SelectMenuContent } from "../../../../_components/inputs/SelectMenu";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { permissionCheck, Permissions } from "../../../../../libs/types/permission";
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
    const [permissions, setPermissions] = useState(0);
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

                router.refresh()
                setModalVisible(false);
            })
            .catch((err) => {
                console.error(err);
                sendToast({
                    description: "Could not send invitation!"
                }, {
                    position: "top-center"
                });
            });
    }, [inviteInfo, router, setModalVisible, triggerInvitation, userHasPermission]);

    const selectionMenuContent = Permissions.map<SelectMenuContent>(permission => ({
        label: permission.label,
        value: permission.value.toString(),
        selected: false
    }));

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
                    disabled={invitationIsSending || !userHasPermission}
                    id="firstName"
                    label="First Name"
                    register={register}
                    required={true}
                    errors={errors}
                />
                <GenericInput
                    disabled={invitationIsSending || !userHasPermission}
                    id="lastName"
                    label="Last Name"
                    register={register}
                    required={true}
                    errors={errors}
                />
            </div>
            <Spacer y={6} />
            <GenericInput
                disabled={invitationIsSending || !userHasPermission}
                id="newEmail"
                label="Email"
                register={register}
                required={true}
                type="email"
                errors={errors}
            />
            <Spacer y={6} />
            <GenericInput
                disabled={invitationIsSending || !userHasPermission}
                id="newUsername"
                label="Username"
                register={register}
                required={true}
                errors={errors}
            />
            <Spacer y={6} />
            <p className="mb-[.5rem]">Permissions</p>
            <SelectMenu
                id="permissions_select"
                content={selectionMenuContent}
                fullWidth
                multiSelect
                disabled={invitationIsSending || !userHasPermission}
                displayCategories={false}
                handleItemSelect={item => {
                    setPermissions(prev =>
                        prev + (!permissionCheck(prev, Number(item.value)) ? Number(item.value) : 0)
                    );
                }}
                handleItemDeselect={item => {
                    setPermissions(prev =>
                        prev - (permissionCheck(prev, Number(item.value)) ? Number(item.value) : 0)
                    );
                }}

            />
            <Spacer y={6} />
            <Divider />
            <Spacer y={6} />
            <GenericButton
                shadow
                loading={invitationIsSending}
                disabled={invitationIsSending || !userHasPermission}
                icon={inviteIcon}
                type="submit"
            >
                Invite
            </GenericButton>
        </form>
    );
}