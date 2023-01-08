import { NextPage } from "next";
import Layout from "../../components/Layout";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { useContext, useEffect, useState } from "react";
import { ModalContext } from "../../components/modals/ModalProvider";
import { NotificationContext } from "../../components/notifications/NotificationProvider";
import DashboardSection from "../../components/dashboard/DashboardSection";
import Button from "../../components/button/Button";
import { ButtonType } from "../../types/ButtonType";
import {
    removeModal,
    sendModal,
    sendNotification,
} from "../../utils/GeneralUtils";
import { v4 } from "uuid";
import { Field, Form } from "react-final-form";
import { userHasPermission } from "../../utils/api/auth";
import { UserPermission } from "../../types/UserPermission";
import { InvitationUser } from "../../utils/mailer/Mailer";
import { NotificationType } from "../../types/NotificationType";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { IUser } from "../../database/mongo/schemas/Users";
import { generate } from "generate-password-ts";
import EmployeeCard from "../../components/EmployeeCard";
import Spinner from "../../components/Spinner";

const Employees: NextPage = () => {
    const router = useRouter();
    // @ts-ignore
    const userData = useSelector((state) => state.userData.value);
    const dispatchModal = useContext(ModalContext);
    const dispatchNotification = useContext(NotificationContext);
    const reduxDispatch = useDispatch();

    const [removeMode, setRemoveMode] = useState(false);
    const toggleRemoveMode = () => {
        setRemoveMode((prev) => !prev);
    };

    const fetchEmployees = useQuery({
        queryKey: ["employees"],
        queryFn: () => {
            return axios.get("/api/user/");
        },
    });

    const sendInvitation = useMutation((invitationUser: InvitationUser) => {
        return axios
            .post("/api/mail/invite", invitationUser)
            .then(() => {
                sendNotification(
                    dispatchNotification,
                    NotificationType.SUCCESS,
                    `Successfully added ${invitationUser.first_name} ${invitationUser.last_name} as an employee. They have been sent an email with their login information.`
                );
            })
            .catch((e) => {
                console.error(e);
                sendNotification(
                    dispatchNotification,
                    NotificationType.ERROR,
                    "There was an error attempting to add a new employee. Check the console for more information and report to the developers."
                );
            });
    });

    const createUser = useMutation((userInfo: IUser) => {
        userInfo.password = generate({ length: 10, numbers: true });

        return axios
            .post("/api/register", userInfo)
            .then(() => {
                sendInvitation.mutate({
                    username: userInfo.username,
                    password:
                        userInfo.password ||
                        generate({ length: 10, numbers: true }),
                    email: userInfo.email,
                    first_name: userInfo.first_name,
                    last_name: userInfo.last_name,
                });
            })
            .catch((e) => {
                console.error(e);
                sendNotification(
                    dispatchNotification,
                    NotificationType.ERROR,
                    "There was an error attempting to add a new employee. Check the console for more information and report to the developers."
                );
            });
    });

    useEffect(() => {
        if (!userData) {
            router.push("/");
            return;
        }

        if (Object.keys(userData).length == 0) {
            router.push("/");
            return;
        }

        if (
            !userHasPermission(
                userData.permissions,
                UserPermission.MANAGE_EMPLOYEES
            )
        ) {
            router.push("/");
            return;
        }
    }, []);

    const generateEmployeeCards = () => {
        // @ts-ignore
        return fetchEmployees.data?.data.map((employee) => (
            <EmployeeCard
                key={employee.username}
                username={employee.username}
                first_name={employee.first_name}
                last_name={employee.last_name}
                avatar={employee.avatar}
                permissions={employee.permissions}
                removeMode={removeMode}
                onRemove={() => {
                    // TODO
                }}
            />
        ));
    };

    return (
        <Layout
            authenticated={userData && Object.keys(userData).length > 0}
            title="Employees"
            pageTitle="Employees"
        >
            <DashboardSection className='flex gap-4'>
                <Button
                    type={ButtonType.SECONDARY}
                    label="Create An Employee"
                    width={14}
                    onClick={() => {
                        const modalID = v4();
                        sendModal(
                            dispatchModal,
                            modalID,
                            "👷 Create An Employee",
                            "Fill out the employee information",
                            <div>
                                <Form
                                    onSubmit={(values) => {
                                        createUser.mutate({
                                            username: values.employeeUserName,
                                            email: values.employeeEmail,
                                            first_name:
                                                values.employeeFirstName,
                                            last_name: values.employeeLastName,
                                            permissions: 0,
                                            creation_date: new Date().getTime(),
                                        });

                                        removeModal(dispatchModal, modalID);
                                    }}
                                    render={({
                                        handleSubmit,
                                        pristine,
                                        submitting,
                                        form,
                                    }) => (
                                        <form onSubmit={handleSubmit}>
                                            <div className="w-3/4 px-40 self-center mx-auto">
                                                <div className="flex justify-between mb-4">
                                                    <label className="self-center text-white text-xl">
                                                        Username
                                                    </label>
                                                    <Field
                                                        name="employeeUserName"
                                                        component="input"
                                                        type="text"
                                                    />
                                                </div>
                                                <div className="flex justify-between mb-4">
                                                    <label className="self-center text-white text-xl">
                                                        First Name
                                                    </label>
                                                    <Field
                                                        name="employeeFirstName"
                                                        component="input"
                                                        type="text"
                                                    />
                                                </div>
                                                <div className="flex justify-between mb-4">
                                                    <label className="self-center text-white text-xl">
                                                        Last Name
                                                    </label>
                                                    <Field
                                                        name="employeeLastName"
                                                        component="input"
                                                        type="text"
                                                    />
                                                </div>
                                                <div className="flex justify-between mb-4">
                                                    <label className="self-center text-white text-xl">
                                                        Email Address
                                                    </label>
                                                    <Field
                                                        name="employeeEmail"
                                                        component="input"
                                                        type="text"
                                                    />
                                                </div>
                                                <div className="flex justify-between mb-4">
                                                    <label className="self-center text-white text-xl">
                                                        Address
                                                    </label>
                                                    <Field
                                                        name="employeeAddress"
                                                        component="input"
                                                        type="text"
                                                    />
                                                </div>
                                                <hr className="mb-6" />
                                                <div className="flex justify-between mb-4">
                                                    <label className="self-center text-white text-xl">
                                                        Job Position
                                                    </label>
                                                    <Field
                                                        name="employeeJobPosition"
                                                        component="input"
                                                        type="text"
                                                    />
                                                </div>
                                                <div className="flex gap-4 justify-center">
                                                    <Button
                                                        type={
                                                            ButtonType.PRIMARY
                                                        }
                                                        submitButton={true}
                                                        isDisabled={
                                                            submitting ||
                                                            pristine
                                                        }
                                                        isWorking={submitting}
                                                    />
                                                    <Button
                                                        type={ButtonType.DANGER}
                                                        label="Reset"
                                                        isDisabled={
                                                            submitting ||
                                                            pristine
                                                        }
                                                        onClick={() => {
                                                            form.reset();
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </form>
                                    )}
                                />
                            </div>
                        );
                    }}
                ></Button>
                <Button
                    type={ButtonType.DANGER_SECONDARY}
                    label={ removeMode ? 'Toggle Remove Move' : 'Remove An Employee'}
                    onClick={() => toggleRemoveMode()}
                />
            </DashboardSection>
            <DashboardSection className="grid gap-4 grid-cols-3 tablet:grid-cols-2 phone:grid-cols-1">
                {fetchEmployees.isLoading ? (
                    <Spinner size={3} />
                ) : (
                    generateEmployeeCards()
                )}
            </DashboardSection>
        </Layout>
    );
};

export default Employees;
