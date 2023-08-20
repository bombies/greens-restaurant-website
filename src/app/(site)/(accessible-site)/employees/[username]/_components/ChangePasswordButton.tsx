"use client";

import passwordIcon from "/public/icons/password.svg";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import React, { useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericInput from "../../../../../_components/inputs/GenericInput";
import { Spacer } from "@nextui-org/react";
import { PASSWORD_REGEX } from "../../../../../../utils/regex";
import axios from "axios";
import { User } from "@prisma/client";
import useSWRMutation from "swr/mutation";
import { useSWRConfig } from "swr";
import GenericModal from "../../../../../_components/GenericModal";
import { toast } from "react-hot-toast";

const ChangePassword = (username: string, password: string, nonAdmin?: boolean) => {
    const dto: Partial<User> = {
        password: password
    };
    const mutator = async (url: string) => await axios.patch(url, dto);
    return useSWRMutation(nonAdmin ? `/api/users/me` : `/api/users/${username}`, mutator);
};

type Props = {
    username: string,
    allowed: boolean,
    checkPrevious?: boolean,
    nonAdmin?: boolean,
}

export default function ChangePasswordButton({ username, allowed, checkPrevious, nonAdmin }: Props) {
    const { mutate } = useSWRConfig();
    const [modalOpen, setModalOpen] = useState(false);
    const { register, handleSubmit } = useForm<FieldValues>();
    const [password, setPassword] = useState("");
    const [oldPasswordChecking, setOldPasswordChecking] = useState(false);

    const {
        trigger: triggerPasswordChange,
        isMutating: passwordIsChanging
    } = ChangePassword(username, password, nonAdmin);

    useEffect(() => {
        if (!password)
            return;
        triggerPasswordChange()
            .then(() => {
                toast.success("Successfully updated this user's password!");
                setModalOpen(false);
            })
            .catch((e) => {
                console.error(e);
                toast.error("There was an error updating this user's password!");
            });
    }, [password, triggerPasswordChange]);

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        if (!allowed)
            return;

        const { password, confirmedPassword, oldPassword } = data;

        if (oldPassword) {
            setOldPasswordChecking(true);

            const checkPassword = async (dto: { password: string }): Promise<{ result: boolean }> => {
                return (await axios.post(`/api/users/${username}/password`, dto)).data;
            };

            const samePassword = await mutate(`/api/users/${username}/password`, checkPassword({
                password: oldPassword
            }));

            if (samePassword === undefined) {
                toast.error("There was an error comparing your old password!");
                setOldPasswordChecking(false);
                return;
            }

            if (!samePassword.result) {
                toast.error("The old password provided doesn't natch your current password!");
                setOldPasswordChecking(false);
                return;
            }

            setOldPasswordChecking(false);
        }

        if (password !== confirmedPassword) {
            toast.error("The passwords do not match!");
            return;
        }

        if (!PASSWORD_REGEX.test(password)) {
            toast.error("Invalid password! Ensure your password has at least 1 uppercase and lowercase character and that it's at least 8 characters long.");
            return;
        }
        setPassword(password);
    };

    return (
        <>
            <GenericButton
                icon={passwordIcon}
                onPress={() => setModalOpen(true)}
                disabled={!allowed}
            >
                Change Password
            </GenericButton>
            <GenericModal
                title="Change Password"
                isOpen={modalOpen && allowed}
                onClose={() => setModalOpen(false)}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    {
                        checkPrevious &&
                        <>
                            <GenericInput
                                register={register}
                                disabled={passwordIsChanging || oldPasswordChecking}
                                type="password"
                                id="oldPassword"
                                label="Old Password"
                                required
                            />
                            <Spacer y={6} />
                        </>
                    }
                    <GenericInput
                        register={register}
                        disabled={passwordIsChanging || oldPasswordChecking}
                        type="password"
                        id="password"
                        label="New Password"
                        required
                    />
                    <Spacer y={6} />
                    <GenericInput
                        register={register}
                        disabled={passwordIsChanging || oldPasswordChecking}
                        type="password"
                        id="confirmedPassword"
                        label="Confirm New Password"
                        required
                    />
                    <Spacer y={6} />
                    <GenericButton
                        type="submit"
                        disabled={passwordIsChanging || oldPasswordChecking}
                        isLoading={passwordIsChanging || oldPasswordChecking}
                    >
                        Change Password
                    </GenericButton>
                </form>
            </GenericModal>
        </>
    );
}