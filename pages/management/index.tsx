import { NextPage } from "next";
import Layout from "../../components/Layout";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { useContext, useEffect, useState } from "react";
import { ModalContext } from "../../components/modals/ModalProvider";
import { NotificationContext } from "../../components/notifications/NotificationProvider";
import { IConfig } from "../../database/mongo/schemas/Config";
import { useMutation } from "react-query";
import axios from "axios";
import { sendNotification } from "../../utils/GeneralUtils";
import { NotificationType } from "../../types/NotificationType";

const Management: NextPage = () => {
    const router = useRouter();
    // @ts-ignore
    const userData = useSelector((state) => state.userData.value);
    const dispatchModal = useContext(ModalContext);
    const dispatchNotification = useContext(NotificationContext);
    const reduxDispatch = useDispatch();

    const placeHolder: IConfig = {
        stockWarningMinimum: 0,
    };

    const [config, setConfig] = useState(placeHolder);

    const getAndSetConfig = useMutation(() => {
        return axios
            .get("/api/management")
            .then((data) => setConfig(data.data))
            .catch(() => {
                // @ts-ignore
                return setConfig(null);
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

        getAndSetConfig.mutate();
    }, []);

    useEffect(() => {
        if (!userData) {
            router.push("/");
            return;
        }

        if (Object.keys(userData).length == 0) {
            router.push("/");
            return;
        }
    }, [userData]);

    useEffect(() => {
        if (!config)
            sendNotification(
                dispatchNotification,
                NotificationType.ERROR,
                "Could not retrieve the configuration file from the database!"
            );
    }, [config]);

    return (
        <Layout
            authenticated={userData && Object.keys(userData).length > 0}
            title="Management"
            pageTitle="Management"
        ></Layout>
    );
};

export default Management;
