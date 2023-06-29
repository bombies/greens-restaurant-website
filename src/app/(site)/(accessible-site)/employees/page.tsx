"use client";

import Title from "../../../_components/text/Title";
import SubTitle from "../../../_components/text/SubTitle";
import GenericButton from "../../../_components/inputs/GenericButton";
import inviteIcon from "/public/icons/invite.svg";
import { useEffect, useState } from "react";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/modal";
import InviteEmployeeForm from "./_components/InviteEmployeeForm";
import EmployeeGrid from "./_components/EmployeeGrid";
import { hasPermission, Permission } from "../../../../libs/types/permission";
import { useRouter } from "next/navigation";
import { useUserData } from "../../../../utils/Hooks";

export default function EmployeesPage() {
    const { data: user, isLoading: userIsLoading } = useUserData();
    const router = useRouter();
    const [inviteModalVisible, setInviteModalVisible] = useState(false);
    const userHasPermission = hasPermission(user?.permissions, Permission.ADMINISTRATOR)

    useEffect(() => {
        if (!userIsLoading && user && !hasPermission(user.permissions, Permission.ADMINISTRATOR))
            return router.push("/home");
    }, [router, user, userIsLoading]);

    return (
        <div>
            <Title>Manage Employees</Title>
            <SubTitle>Invite an employee to or remove an employee from the website.</SubTitle>
            <div className={"my-12 default-container p-12 w-fit"}>
                <GenericButton
                    disabled={!userHasPermission}
                    shadow
                    icon={inviteIcon}
                    onClick={() => setInviteModalVisible(true)}
                >
                    Invite Employee
                </GenericButton>
                <Modal
                    size="3xl"
                    className="bg-neutral-800"
                    isOpen={inviteModalVisible}
                    onClose={() => setInviteModalVisible(false)}
                    backdrop="opaque"
                >
                    <ModalContent>
                        <ModalHeader>
                            <SubTitle thick>Invite an Employee</SubTitle>
                        </ModalHeader>
                        <ModalBody>
                            <div className="p-6 w-3/4">
                                <InviteEmployeeForm
                                    setModalVisible={setInviteModalVisible}
                                    userHasPermission={userHasPermission}
                                />
                            </div>
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </div>
            <div className="p-12 default-container w-5/6">
                <SubTitle>Employees</SubTitle>
                <EmployeeGrid />
            </div>
        </div>
    );
}