"use client";

import Title from "../../../_components/text/Title";
import { Skeleton, Spacer } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { Avatar } from "@nextui-org/avatar";
import { CldUploadButton } from "next-cloudinary";
import React, { useEffect, useState } from "react";
import { User } from "@prisma/client";
import useSWRImmutable from "swr/immutable";
import { fetcher } from "../employees/_components/EmployeeGrid";
import { compare } from "../../../../utils/GeneralUtils";
import { DataGroupContainer, UpdateUser } from "../employees/[username]/_components/Employee";
import { sendToast } from "../../../../utils/Hooks";
import ChangesMadeBar from "../employees/[username]/_components/ChangesMadeBar";
import EditableEmployeeField, { DataContainer } from "../employees/[username]/_components/EditableEmployeeField";
import { EMAIL_REGEX, NAME_REGEX, USERNAME_REGEX } from "../../../../utils/regex";
import { Divider } from "@nextui-org/divider";
import ChangePasswordButton from "../employees/[username]/_components/ChangePasswordButton";

const useSelfData = (username?: string) => {
    return useSWRImmutable(`/api/users/${username}`, fetcher<User>);
};

export default function AccountPage() {
    const session = useSession();
    const { data: user, isLoading: userIsLoading } = useSelfData(session.data?.user?.username);
    const [currentData, setCurrentData] = useState<Partial<User>>();
    const [changesMade, setChangesMade] = useState(false);
    const {
        trigger: triggerUserUpdate,
        isMutating: userIsUpdating
    } = UpdateUser(session.data?.user?.username, currentData);

    useEffect(() => {
        if (!userIsLoading && user)
            setCurrentData(user);
    }, [user, userIsLoading]);

    useEffect(() => {
        if (!user)
            return;
        setChangesMade(!compare(currentData, user));
    }, [currentData, user]);

    const handleImageUpload = (result: any) => {
        setCurrentData(prev => ({
            ...prev,
            image: result?.info?.secure_url
        }));
    };

    const doUpdate = () => {
        triggerUserUpdate()
            .then((value) => {
                const newUser: User | undefined = value?.data;

                // The gods have blessed us with an impossible error
                if (!newUser) {
                    sendToast({
                        description: "Something went wrong! An undefined user was returned."
                    }, {
                        position: "top-center"
                    });
                    return;
                }

                sendToast({
                    description: "Successfully updated your account!"
                });
            })
            .catch((e) => {
                console.log(e);
                sendToast({
                    description: "Could not update your account!"
                }, {
                    position: "top-center"
                });
            });
    };

    return (
        <div>
            <ChangesMadeBar
                isChanging={userIsUpdating}
                changesMade={changesMade}
                onAccept={doUpdate}
                onReject={() => {
                    setCurrentData(user);
                    sendToast({ description: "Discarded all changes." });
                }} />
            <Title>My Account</Title>
            <Spacer y={12} />
            <div className="default-container p-12 phone:px-6">
                {
                    userIsLoading ?
                        <>
                            <Skeleton className="rounded-full w-24 h-24" />
                            <Spacer x={6} />
                            <div className="self-center">
                                <Skeleton className="rounded-xl w-36 h-4" />
                                <Spacer y={1} />
                                <Skeleton className="rounded-xl w-28 h-2" />
                            </div>
                        </>
                        :
                        <>
                            <div className="flex gap-4 phone:gap-2">
                                <CldUploadButton
                                    options={{
                                        maxFiles: 1,
                                        maxFileSize: 1000000,
                                        resourceType: "image"
                                    }}
                                    onUpload={handleImageUpload}
                                    uploadPreset="kyyplgrx"
                                >
                                    <Avatar
                                        src={currentData?.image || undefined} size="xl"
                                        className="transition-fast hover:brightness-150 cursor-pointer w-24 phone:w-16 h-24 phone:h-16"
                                    />
                                </CldUploadButton>
                                <Spacer x={6} />
                                <div className="self-center">
                                    <p className="text-3xl text-primary font-semibold">{currentData?.username}</p>
                                    <p className="text-secondary-text phone:text-sm">{`Created on ${new Date(currentData?.createdAt || 0).toLocaleDateString()} at ${new Date(currentData?.createdAt || 0).toLocaleTimeString()}`}</p>
                                </div>
                            </div>
                            <Spacer y={12} />
                            <div className="default-container p-12 tablet:px-6 phone:px-2 w-3/4 tablet:w-full">
                                <DataGroupContainer>
                                    <EditableEmployeeField
                                        label="username"
                                        editAllowed={false}
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
                                        editAllowed={false}
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
                                        editAllowed={false}
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
                                <DataGroupContainer direction="vertical">
                                    <EditableEmployeeField
                                        label="email address"
                                        editAllowed={true}
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
                                    <DataContainer
                                        label="Password"
                                        editAllowed={true}
                                    >
                                        <ChangePasswordButton
                                            username={currentData?.username || ""}
                                            allowed={true}
                                            checkPrevious={true}
                                        />
                                    </DataContainer>
                                </DataGroupContainer>
                            </div>
                        </>
                }
            </div>
        </div>
    );
}