"use client";

import Title from "../../../_components/text/Title";
import SubTitle from "../../../_components/text/SubTitle";
import GenericButton from "../../../_components/inputs/GenericButton";
import inviteIcon from "/public/icons/invite.svg";
import { useState } from "react";
import InviteEmployeeForm from "./_components/InviteEmployeeForm";
import EmployeeGrid, { fetcher } from "./_components/EmployeeGrid";
import { hasPermission, Permission } from "../../../../libs/types/permission";
import { useUserData } from "../../../../utils/Hooks";
import GenericModal from "../../../_components/GenericModal";
import useSWR from "swr";
import { User } from "@prisma/client";

const useEmployeeInfo = () => {
    return useSWR("/api/users", fetcher<User[]>);
};

export default function EmployeesPage() {
    const { data: user } = useUserData([Permission.ADMINISTRATOR]);
    const employeeInfo = useEmployeeInfo();
    const [inviteModalVisible, setInviteModalVisible] = useState(false);
    const userHasPermission = hasPermission(user?.permissions, Permission.ADMINISTRATOR);

    return (
        <div>
            <Title>Manage Employees</Title>
            <SubTitle>Invite an employee to or remove an employee from the website.</SubTitle>
            <div className={"my-12 default-container p-6 w-fit"}>
                <GenericButton
                    disabled={!userHasPermission}
                    icon={inviteIcon}
                    onPress={() => setInviteModalVisible(true)}
                >
                    Invite Employee
                </GenericButton>
                <GenericModal
                    size="3xl"
                    isOpen={inviteModalVisible}
                    onClose={() => setInviteModalVisible(false)}
                    title="Invite an Employee"
                >
                    <InviteEmployeeForm
                        setModalVisible={setInviteModalVisible}
                        userHasPermission={userHasPermission}
                        employees={employeeInfo.data ?? []}
                        mutateEmployees={employeeInfo.mutate}
                    />
                </GenericModal>
            </div>
            <div className="p-6 default-container w-5/6">
                <SubTitle>Employees</SubTitle>
                <EmployeeGrid employees={employeeInfo} />
            </div>
        </div>
    );
}