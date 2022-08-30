import { NextPage } from "next";
import Layout from "../../components/Layout";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { useContext } from "react";
import { ModalContext } from "../../components/modals/ModalProvider";
import { NotificationContext } from "../../components/notifications/NotificationProvider";

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
            <div>
                <p>Welcome to the party</p>
            </div>
        </Layout>
    );
};

export default Employees;
