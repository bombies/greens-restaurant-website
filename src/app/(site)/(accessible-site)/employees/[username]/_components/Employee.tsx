"use client";

import { User } from "@prisma/client";
import SubTitle from "../../../../../_components/text/SubTitle";
import GenericButton from "../../../../../_components/inputs/GenericButton";
import trashIcon from "/public/icons/trash.svg";
import passwordIcon from "/public/icons/password.svg";
import useSWR from "swr";
import { fetcher } from "../../_components/EmployeeGrid";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Checkbox, CheckboxGroup, Spacer } from "@nextui-org/react";
import Link from "next/link";
import BackIcon from "../../../../../_components/icons/BackIcon";
import { Divider } from "@nextui-org/divider";
import Permission, { permissionCheck } from "../../../../../../libs/types/permission";
import { compare } from "../../../../../../utils/GeneralUtils";
import ChangesMadeBar from "./ChangesMadeBar";
import { sendToast } from "../../../../../../utils/Hooks";
import EditableEmployeeField from "./EditableEmployeeField";
import { EMAIL_REGEX, NAME_REGEX, USERNAME_REGEX } from "../../../../../../utils/regex";

type Props = {
    username: string
}

const useEmployeeData = (username: string) => {
    return useSWR(`/api/users/${username}`, fetcher<User>);
};

export default function Employee({ username }: Props) {
    const { data: user, isLoading, error } = useEmployeeData(username);
    const router = useRouter();
    const [currentData, setCurrentData] = useState<Partial<User>>();
    const [changesMade, setChangesMade] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    useEffect(() => {
        if (!isLoading && !user)
            router.push("/employees");
        else if (!isLoading && user)
            setCurrentData(user);
    }, [isLoading, router, user]);

    useEffect(() => {
        if (!user)
            return;
        setChangesMade(!compare(currentData, user));
    }, [currentData, user]);

    useEffect(() => {
        if (!user)
            return;

        const permissions = Object.values(Permission)
            .filter(v => !isNaN(Number(v)))
            .filter(perm => permissionCheck(user.permissions, Number(perm)))
            .map(value => value.toString());

        setSelectedPermissions(permissions);
    }, [user]);

    return (
        <div>
            <ChangesMadeBar
                changesMade={changesMade}
                onAccept={() => {
                    sendToast({ description: "Changes accepted" });
                }}
                onReject={() => {
                    sendToast({ description: "Changes rejected" });
                }} />
            <div className="default-container p-12">
                <GoBackButton />
                <Spacer y={6} />
                <SubTitle>Account Actions</SubTitle>
                <Spacer y={6} />
                <div className="flex phone:flex-col gap-4">
                    <GenericButton shadow icon={passwordIcon}>
                        Change Password
                    </GenericButton>
                    <GenericButton shadow color="danger" icon={trashIcon}>
                        Delete Employee
                    </GenericButton>
                </div>
            </div>
            <Spacer y={12} />
            <div className="default-container p-12 phone:p-6">
                {
                    isLoading ? <div>Loading...</div>
                        :
                        (error ? <div>Error :(</div>
                                :
                                <div>
                                    <div className="default-container p-6 phone:p-3 w-3/4 tablet:w-full">
                                        <SubTitle>Account Settings</SubTitle>
                                        <DataGroupContainer>
                                            <EditableEmployeeField
                                                label="username"
                                                field={currentData?.username}
                                                validate={{
                                                    test(value) {
                                                        return USERNAME_REGEX.test(value);
                                                    },
                                                    message: "Invalid username! The username must contain only alphanumeric characters."
                                                }}
                                                onValueChange={value => {
                                                    setCurrentData(prev => ({
                                                        ...prev,
                                                        username: value
                                                    }));
                                                }}
                                            />
                                        </DataGroupContainer>
                                        <Spacer y={6} />
                                        <Divider />
                                        <Spacer y={6} />
                                        <DataGroupContainer>
                                            <EditableEmployeeField
                                                label="first name"
                                                field={currentData?.firstName}
                                                capitalizeField
                                                validate={{
                                                    test(value) {
                                                        return NAME_REGEX.test(value);
                                                    },
                                                    message: "Invalid first name!"
                                                }}
                                                onValueChange={value => setCurrentData(prev => ({
                                                    ...prev,
                                                    firstName: value.toLowerCase()
                                                }))}
                                            />
                                            <EditableEmployeeField
                                                label="last name"
                                                field={currentData?.lastName}
                                                capitalizeField
                                                validate={{
                                                    test(value) {
                                                        return NAME_REGEX.test(value);
                                                    },
                                                    message: "Invalid last name!"
                                                }}
                                                onValueChange={value => setCurrentData(prev => ({
                                                    ...prev,
                                                    lastName: value.toLowerCase()
                                                }))}
                                            />
                                        </DataGroupContainer>
                                        <Spacer y={6} />
                                        <Divider />
                                        <Spacer y={6} />
                                        <DataGroupContainer>
                                            <EditableEmployeeField
                                                label="email address"
                                                field={currentData?.email}
                                                validate={{
                                                    test(value) {
                                                        return EMAIL_REGEX.test(value);
                                                    },
                                                    message: "Invalid email!"
                                                }}
                                                onValueChange={value => setCurrentData(prev => ({
                                                    ...prev,
                                                    email: value
                                                }))}
                                            />
                                        </DataGroupContainer>
                                    </div>
                                    <Spacer y={6} />
                                    <div className="default-container p-6 w-3/4 tablet:w-full">
                                        <SubTitle>Permissions</SubTitle>
                                        <div className="p-3">
                                            <CheckboxGroup
                                                color="secondary"
                                                label="Select Permissions"
                                                value={selectedPermissions}
                                                onChange={values => {
                                                    setSelectedPermissions(values);

                                                    const permissions = values.length ? values.map(val => Number(val)).reduce((prev, curr) => {
                                                        return prev + curr;
                                                    }) : 0;

                                                    setCurrentData(prev => ({
                                                        ...prev,
                                                        permissions: permissions
                                                    }));
                                                }}
                                            >
                                                <Checkbox
                                                    value={Permission.ADMINISTRATOR.toString()}>Administrator</Checkbox>
                                                <Checkbox value={Permission.CREATE_INVENTORY.toString()}>Create
                                                    Inventory</Checkbox>
                                                <Checkbox value={Permission.VIEW_INVENTORY.toString()}>View
                                                    Inventory</Checkbox>
                                                <Checkbox value={Permission.MUTATE_STOCK.toString()}>Mutate
                                                    Stock</Checkbox>
                                                <Checkbox value={Permission.CREATE_INVOICE.toString()}>Create
                                                    Invoice</Checkbox>
                                                <Checkbox value={Permission.VIEW_INVOICES.toString()}>View
                                                    Invoices</Checkbox>
                                            </CheckboxGroup>
                                        </div>
                                    </div>
                                </div>
                        )
                }
            </div>
        </div>
    );
}

function GoBackButton() {
    const [iconColor, setIconColor] = useState("#ffffff");
    const setActiveColor = () => setIconColor("#00D615");
    const setDefaultColor = () => setIconColor("#ffffff");

    const icon = <BackIcon width="1.25rem" height="1.25rem" className="self-center transition-fast" fill={iconColor} />;

    return (
        <Link href="/employees">
            <div
                className="flex gap-4 transition-fast hover:-translate-x-1 hover:text-primary"
                onMouseEnter={() => setActiveColor()}
                onMouseLeave={() => setDefaultColor()}
            >
                {icon}
                <p className="font-light">View all employees</p>
            </div>
        </Link>
    );
}

export function DataGroupContainer({ children }: React.PropsWithChildren) {
    return (
        <div className="flex phone:flex-col gap-12 p-3">
            {children}
        </div>
    );
}