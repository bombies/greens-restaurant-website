"use client";

import { User } from "@prisma/client";
import SubTitle from "../../../../../_components/text/SubTitle";
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
import { errorToast } from "../../../../../../utils/Hooks";
import EditableField from "./EditableField";
import { EMAIL_REGEX, NAME_REGEX, USERNAME_REGEX } from "../../../../../../utils/regex";
import ChangePasswordButton from "./ChangePasswordButton";
import DeleteEmployeeButton from "./DeleteEmployeeButton";
import { useSession } from "next-auth/react";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import useSWRImmutable from "swr/immutable";
import ContainerSkeleton from "../../../../../_components/skeletons/ContainerSkeleton";
import { DataGroupContainer } from "../../../../../_components/DataGroupContainer";
import { toast } from "react-hot-toast";
import { UpdateUserDto } from "../../../../../api/users/[username]/route";

type Props = {
    username: string
}

const useEmployeeData = (username: string) => {
    return useSWRImmutable(`/api/users/${username}`, fetcher<User>);
};

export type UpdateUserArgs = {
    arg: {
        dto?: UpdateUserDto
    }
}

export const UpdateUser = (username?: string, nonAdmin?: boolean) => {
    const mutator = (url: string, { arg }: UpdateUserArgs) => {
        // @ts-ignore
        const { id, createdAt, updatedAt, image, createdInventoryIds, assignedStockRequestsIds, password, ...validDto } = arg.dto;
        return axios.patch(url, validDto);
    };
    return useSWRMutation(nonAdmin ? `/api/users/me` : `/api/users/${username}`, mutator);
};

export default function Employee({ username }: Props) {
    const session = useSession();
    const { data: user, isLoading, error: employeeDataError } = useEmployeeData(username);
    const router = useRouter();
    const [currentData, setCurrentData] = useState<UpdateUserDto>();
    const [changesMade, setChangesMade] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [editAllowed, setEditAllowed] = useState(false);

    const {
        trigger: triggerUserUpdate,
        isMutating: userIsUpdating
    } = UpdateUser(username);

    useEffect(() => {
        if (session.status !== "loading" && session.data?.user?.username !== "root" && username === "root")
            router.push("/employees");
    }, [router, session.data?.user?.username, session.status, username]);

    useEffect(() => {
        if (!isLoading && !user) {
            if (employeeDataError)
                console.error("employee data error", employeeDataError);
            router.push("/employees");
        } else if (!isLoading && user) {
            setCurrentData(user);
            setEditAllowed(
                permissionCheck(user.permissions, Permission.ADMINISTRATOR) ?
                    session.data?.user?.username === user.username
                    || session.data?.user?.username === "root"
                    :
                    true
            );
        }
    }, [employeeDataError, isLoading, router, session.data?.user?.username, user]);

    useEffect(() => {
        if (isLoading || !user)
            return;
        setChangesMade(!compare(currentData, user));
    }, [currentData, isLoading, user]);

    useEffect(() => {
        if (!user)
            return;

        const permissions = Object.values(Permission)
            .filter(v => !isNaN(Number(v)))
            .filter(perm => permissionCheck(user.permissions, Number(perm)))
            .map(value => value.toString());

        setSelectedPermissions(permissions);
    }, [user]);

    const doUpdate = () => {
        triggerUserUpdate({
            dto: currentData
        })
            .then((value) => {
                const newUser: User | undefined = value?.data;

                // The gods have blessed us with an impossible error
                if (!newUser) {
                    toast.error("Something went wrong! An undefined user was returned.");
                    return;
                }

                // If the DTO contained a new username, the url slug will have to be updated.
                if (newUser.username !== user?.username) {
                    router.replace(`/employees/${newUser.username}`);
                    router.refresh();
                }

                toast.success("Successfully updated user!");
            })
            .catch((e) => {
                errorToast(e, "Could not update user!");
            });
    };

    // @ts-ignore
    return (
        <div>
            <ChangesMadeBar
                isChanging={userIsUpdating}
                changesMade={changesMade}
                onAccept={doUpdate}
                onReject={() => {
                    setCurrentData(user);

                    const permissions = Object.values(Permission)
                        .filter(v => !isNaN(Number(v)))
                        .filter(perm => permissionCheck(user!.permissions, Number(perm)))
                        .map(value => value.toString());

                    setSelectedPermissions(permissions);
                    toast("Discarded all changes.");
                }} />
            <div className="default-container p-12">
                <GoBackButton />
                <Spacer y={6} />
                <SubTitle>Account Actions</SubTitle>
                <Spacer y={6} />
                <div className="flex phone:flex-col gap-4">
                    <ChangePasswordButton username={username} allowed={editAllowed} />
                    <DeleteEmployeeButton username={username} allowed={editAllowed} />
                </div>
            </div>
            <Spacer y={12} />
            <div className="default-container p-12 phone:p-6">
                {
                    isLoading ?
                        <div className="flex flex-col gap-y-6">
                            <ContainerSkeleton width="3/4" contentRepeat={3} />
                            <ContainerSkeleton width="3/4" contentRepeat={1} />
                        </div>
                        :
                        (employeeDataError ? <div>Error :(</div>
                                :
                                <div>
                                    <div className="default-container p-6 phone:p-3 w-3/4 tablet:w-full">
                                        <SubTitle>Account Settings</SubTitle>
                                        <DataGroupContainer>
                                            <EditableField
                                                label="username"
                                                editAllowed={editAllowed}
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
                                            <EditableField
                                                label="first name"
                                                editAllowed={editAllowed}
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
                                            <EditableField
                                                label="last name"
                                                editAllowed={editAllowed}
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
                                            <EditableField
                                                label="email address"
                                                editAllowed={editAllowed}
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
                                                isDisabled={!editAllowed}
                                                onValueChange={(values: string[]) => {
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
                                                <div className="grid grid-rows-5 phone:grid-flow-row phone:grid-cols-1 grid-flow-col gap-y-4">
                                                    <Checkbox
                                                        value={Permission.ADMINISTRATOR.toString()}
                                                        isDisabled={
                                                            session.data?.user?.username === username
                                                            || session.data?.user?.username !== "root"
                                                        }
                                                    >
                                                        Administrator
                                                    </Checkbox>
                                                    <Checkbox value={Permission.CREATE_INVENTORY.toString()}>Create
                                                        Inventory</Checkbox>
                                                    <Checkbox value={Permission.VIEW_INVENTORY.toString()}>View
                                                        Inventory</Checkbox>
                                                    <Checkbox value={Permission.MUTATE_STOCK.toString()}>Mutate
                                                        Stock</Checkbox>
                                                    <Checkbox value={Permission.CREATE_INVOICE.toString()}>Create
                                                        Invoice</Checkbox>
                                                    <Checkbox value={Permission.MANAGE_STOCK_REQUESTS.toString()}>Manage
                                                        Stock Requests</Checkbox>
                                                    <Checkbox value={Permission.VIEW_STOCK_REQUESTS.toString()}>View Stock
                                                        Requests</Checkbox>
                                                    <Checkbox value={Permission.CREATE_STOCK_REQUEST.toString()}>Create
                                                        Stock Request</Checkbox>
                                                    <Checkbox value={Permission.VIEW_INVOICES.toString()}>View
                                                        Invoices</Checkbox>
                                                </div>
                                            </CheckboxGroup>
                                        </div>
                                        <Spacer y={6} />
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

