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
import { handleAxiosError, objectCompare, sendNotification } from "../../utils/GeneralUtils";
import { NotificationType } from "../../types/NotificationType";
import TextBox from "../../components/TextBox";
import DashboardRow from "../../components/dashboard/DashboardRow";
import DashboardSection from "../../components/dashboard/DashboardSection";
import Button from "../../components/button/Button";
import { ButtonType } from "../../types/ButtonType";
import { generateDefaultConfig } from "../../utils/api/ApiUtils";

const Management: NextPage = () => {
    const router = useRouter();
    // @ts-ignore
    const userData = useSelector((state) => state.userData.value);
    const dispatchModal = useContext(ModalContext);
    const dispatchNotification = useContext(NotificationContext);
    const reduxDispatch = useDispatch();

    const placeHolder: IConfig = generateDefaultConfig();

    const [config, setConfig] = useState(placeHolder);
    const [originalConfig, setOriginalConfig] = useState({});
    const [changesMade, setChangesMade] = useState(false);

    const getAndSetConfig = useMutation(() => {
        return axios
            .get("/api/management")
            .then((data) => {
                setConfig(data.data);
                setOriginalConfig(data.data);
            })
            .catch((e) => {
                console.error(e);
                // @ts-ignore
                return setConfig(null);
            });
    });

    const updateConfig = useMutation(() => {
        return axios
            .patch("/api/management", config)
            .then(data => {
                console.log(data.data);
                setOriginalConfig(data.data);
                setChangesMade(false);
                sendNotification(
                    dispatchNotification,
                    NotificationType.SUCCESS,
                    "You have successfully updated the configuration!"
                )
            })
            .catch(e => handleAxiosError(dispatchNotification, e));
    });

    const save = () => {
        if (!changesMade) return;
        updateConfig.mutate();
    };

    const discard = () => {
        if (!changesMade) return;
        // @ts-ignore
        setConfig(originalConfig);
        setChangesMade(false);
    }

    const checkForChanges = (obj: Object) => {
        // @ts-ignore
        if (!objectCompare(originalConfig, obj)) setChangesMade(true);
        else setChangesMade(false);
    };

    const setMinStock = (x: number) => {
        if (isNaN(x)) return;
        setConfig((prev) => {
            const newObj = { ...prev, inventory: {...prev.inventory, stockWarningMinimum: Number(x) }  };
            checkForChanges(newObj);
            return newObj;
        });
    };

    const addJobPosition = (job: string) => {
        if (!job) return;
        setConfig(prev => {
            const newObj = { ...prev, employees: {...prev.employees, jobPositions: [...prev.employees.jobPositions, job] }  };
            checkForChanges(newObj);
            return newObj;
        });
    };

    const removeJobPosition = (job: string) => {
        if (!job) return;
        setConfig(prev => {
            const newObj = { ...prev, employees: {...prev.employees, jobPositions: prev.employees.jobPositions.filter(e => e !== job) } };
            checkForChanges(newObj);
            return newObj;
        });
    }

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
        >
            <div
                className={`fixed ${
                    changesMade ? "bottom-5" : "bottom-[-200px]"
                } bg-neutral-100 dark:bg-neutral-900 p-8 rounded-2xl shadow-md transition-fast w-3/4 flex justify-between`}
            >
                <p className="dark:text-white self-center text-xl">
                    Careful - You have unsaved changes!
                </p>
                <div className="flex gap-4">
                    <Button
                        type={ButtonType.PRIMARY}
                        icon="https://i.imgur.com/ooM2GsJ.png"
                        label="Save"
                        width={9}
                        height={3}
                        onClick={() => save()}
                        isWorking={updateConfig.isLoading}
                    />
                    <Button
                        type={ButtonType.SECONDARY}
                        icon="https://i.imgur.com/zJlGYwz.png"
                        label="Discard"
                        width={9}
                        height={3}
                        onClick={() => discard()}
                    />
                </div>
            </div>
            <DashboardSection title="Inventory Settings">
                <DashboardRow
                    title="Minimum Stock Warning"
                    description="Set the minimum value a stock can have before a low stock warning is given."
                    component={
                        <TextBox
                            placeholder="Enter a value..."
                            numbersOnly={true}
                            value={config.inventory.stockWarningMinimum}
                            onChange={(e) => {
                                // @ts-ignore
                                setMinStock(e.target.value);
                            }}
                        />
                    }
                />
            </DashboardSection>
        </Layout>
    );
};

export default Management;
