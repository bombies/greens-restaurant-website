import { NextPage } from "next";
import Layout from "../../components/Layout";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { useContext } from "react";
import { ModalContext } from "../../components/modals/ModalProvider";
import { NotificationContext } from "../../components/notifications/NotificationProvider";
import DashboardSection from "../../components/dashboard/DashboardSection";
import Button from "../../components/button/Button";
import { ButtonType } from "../../types/ButtonType";
import { removeModal, sendModal } from "../../utils/GeneralUtils";
import { v4 } from "uuid";
import { Field, Form } from "react-final-form";

const Employees: NextPage = () => {
    const router = useRouter();
    // @ts-ignore
    const userData = useSelector((state) => state.userData.value);
    const dispatchModal = useContext(ModalContext);
    const dispatchNotification = useContext(NotificationContext);
    const reduxDispatch = useDispatch();

    return (
        <Layout
            authenticated={userData && Object.keys(userData).length > 0}
            title="Employees"
            pageTitle="Employees"
        >
            <DashboardSection>
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
                                        removeModal(dispatchModal, modalID);
                                    }}
                                    render={({
                                        handleSubmit,
                                        pristine,
                                        submitting,
                                        form,
                                    }) => (
                                        <form onSubmit={handleSubmit}>
                                            <div className="px-40 items-center gap-4">
                                                <div className="flex justify-between mb-4">
                                                    <label className='self-center'>First Name</label>
                                                    <Field
                                                        name="employeeFirstName"
                                                        component="input"
                                                        type="text"
                                                    />
                                                </div>
                                                <div className="flex justify-between mb-4">
                                                    <label className='self-center'>Last Name</label>
                                                    <Field
                                                        name="employeeLastName"
                                                        component="input"
                                                        type="text"
                                                    />
                                                </div>
                                                <div className="flex justify-between mb-4">
                                                    <label className='self-center'>Email Address</label>
                                                    <Field
                                                        name="employeeEmail"
                                                        component="input"
                                                        type="text"
                                                    />
                                                </div>
                                                <div className="flex justify-between mb-4">
                                                    <label className='self-center'>Address</label>
                                                    <Field
                                                        name="employeeAddress"
                                                        component="input"
                                                        type="text"
                                                    />
                                                </div>
                                                <hr className='mb-6' />
                                                <div className="flex justify-between mb-4">
                                                    <label className='self-center'>Job Position</label>
                                                    <Field
                                                        name="employeeJobPosition"
                                                        component="input"
                                                        type="text"
                                                    />
                                                </div>
                                                <div className='flex gap-4 justify-center'>
                                                    <Button
                                                        type={ButtonType.PRIMARY}
                                                        submitButton={true}
                                                        isDisabled={
                                                            submitting || pristine
                                                        }
                                                        isWorking={submitting}
                                                    />
                                                    <Button
                                                        type={ButtonType.DANGER}
                                                        label='Reset'
                                                        isDisabled={
                                                            submitting || pristine
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
            </DashboardSection>
        </Layout>
    );
};

export default Employees;
