"use client";

import { useSession } from "next-auth/react";
import Title from "../../../_components/text/Title";
import SubTitle from "../../../_components/text/SubTitle";
import GenericButton from "../../../_components/inputs/GenericButton";
import inviteIcon from "/public/icons/invite.svg";
import { useEffect, useState } from "react";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/modal";
import InviteEmployeeForm from "./_components/InviteEmployeeForm";
import EmployeeGrid from "./_components/EmployeeGrid";
import { User } from "@prisma/client";

export default function EmployeesPage() {
    const user = useSession();
    const [inviteModalVisible, setInviteModalVisible] = useState(false);

    return (
        <div>
            <Title>Manage Employees</Title>
            <SubTitle>Invite an employee to or remove an employee from the website.</SubTitle>
            <div className={"my-12 default-container p-12 w-fit"}>
                <GenericButton
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
                    showCloseButton={true}
                    backdrop="opaque"
                >
                    <ModalContent>
                        <ModalHeader>
                            <SubTitle thick>Invite an Employee</SubTitle>
                        </ModalHeader>
                        <ModalBody>
                            <div className="p-6 w-3/4">
                                <InviteEmployeeForm setModalVisible={setInviteModalVisible} />
                            </div>
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </div>
            <div className='p-12 default-container w-5/6'>
                <SubTitle>Employees</SubTitle>
                <EmployeeGrid />
            </div>
        </div>
    );
}