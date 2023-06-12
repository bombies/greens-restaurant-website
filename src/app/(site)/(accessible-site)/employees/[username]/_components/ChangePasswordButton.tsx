"use client";

import passwordIcon from "/public/icons/password.svg";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import React, { useEffect, useState } from "react";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/modal";
import SubTitle from "../../../../../_components/text/SubTitle";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import GenericInput from "../../../../../_components/inputs/GenericInput";
import { Spacer } from "@nextui-org/react";
import { sendToast } from "../../../../../../utils/Hooks";
import { PASSWORD_REGEX } from "../../../../../../utils/regex";
import axios from "axios";
import { User } from "@prisma/client";
import useSWRMutation from "swr/mutation";

const ChangePassword = (username: string, password: string) => {
    const dto: Partial<User> = {
        password: password
    };
    const mutator = async (url: string) => await axios.patch(url, dto);
    return useSWRMutation(`/api/users/${username}`, mutator);
};

type Props = {
    username: string,
    allowed: boolean
}

export default function ChangePasswordButton({ username, allowed }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const { register, handleSubmit } = useForm<FieldValues>();
    const [password, setPassword] = useState("");
    const {
        trigger: triggerPasswordChange,
        isMutating: passwordIsChanging,
        error: passwordChangeError
    } = ChangePassword(username, password);

    useEffect(() => {
        if (!password)
            return;
        triggerPasswordChange()
            .then(() => {
                sendToast({
                    description: "Successfully updated this user's password!"
                }, {
                    position: "top-center"
                });
                setModalOpen(false);
            })
            .catch((e) => {
                console.log(e);
                sendToast({
                    description: "There was an error updating this user's password!"
                }, {
                    position: "top-center"
                });
            });
    }, [password, triggerPasswordChange]);

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        if (!allowed)
            return;

        const { password, confirmedPassword } = data;

        if (password !== confirmedPassword) {
            sendToast({
                description: "The passwords do not match!"
            }, {
                position: "top-center"
            });
            return;
        }

        if (!PASSWORD_REGEX.test(password)) {
            sendToast({
                description: "Invalid password! Ensure your password has at least 1 uppercase and lowercase character and that it's at least 8 characters long."
            }, {
                position: "top-center"
            });
            return;
        }
        setPassword(password);
    };

    return (
        <>
            <GenericButton
                shadow
                icon={passwordIcon}
                onClick={() => setModalOpen(true)}
                disabled={!allowed}
            >
                Change Password
            </GenericButton>
            <Modal
                size="2xl"
                className="bg-neutral-800"
                isOpen={modalOpen && allowed}
                onClose={() => setModalOpen(false)}
                showCloseButton={true}
                backdrop="opaque"
            >
                <ModalContent>
                    <ModalHeader>
                        <SubTitle thick>Change Password</SubTitle>
                    </ModalHeader>
                    <ModalBody>
                        <div className="p-6">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <GenericInput
                                    register={register}
                                    disabled={passwordIsChanging}
                                    type="password"
                                    id="password"
                                    label="New Password"
                                    required
                                />
                                <Spacer y={6} />
                                <GenericInput
                                    register={register}
                                    disabled={passwordIsChanging}
                                    type="password"
                                    id="confirmedPassword"
                                    label="Confirm New Password"
                                    required
                                />
                                <Spacer y={6} />
                                <GenericButton
                                    type="submit"
                                    disabled={passwordIsChanging}
                                    loading={passwordIsChanging}
                                    shadow
                                >
                                    Change Password
                                </GenericButton>
                            </form>
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}