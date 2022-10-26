import { NextPage } from "next";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Button from "../../components/button/Button";
import { ButtonType } from "../../types/ButtonType";
import { NotificationContext } from "../../components/notifications/NotificationProvider";
import { InventoryCategoryObject } from "../../types/InventoryCategoryObject";
import { ModalContext } from "../../components/modals/ModalProvider";
import {
    GenerateGenericModalAddAction,
    GenerateGenericModalRemoveAction,
} from "../../components/modals/ModalTypes";
import { v4 } from "uuid";
import { useSelector } from "react-redux";
import { Field, Form } from "react-final-form";
import CategoryCard from "../../components/inventory/CategoryCard";
import { GenerateNotificationAddAction } from "../../components/notifications/NotificationTypes";
import { NotificationType } from "../../types/NotificationType";
import Layout from "../../components/Layout";
import { useMutation } from "react-query";
import axios from "axios";
import { handleAxiosError } from "../../utils/GeneralUtils";
import DashboardSection from "../../components/dashboard/DashboardSection";
import Spinner from "../../components/Spinner";

// @ts-ignore
const Index: NextPage = () => {
    const router = useRouter();
    // @ts-ignore
    const userData = useSelector((state) => state.userData.value);
    const dispatchNotification = useContext(NotificationContext);
    const dispatchModal = useContext(ModalContext);

    let initCategoryState: InventoryCategoryObject[] = [];
    const [categories, setCategories] = useState(initCategoryState);

    const getAndSetCategories = useMutation(() => {
        return axios.get("/api/inventory").then((data) => {
            setCategories(data.data);
        });
    });

    const addCategory = useMutation((categoryInfo: InventoryCategoryObject) => {
        return axios
            .post("/api/inventory", categoryInfo)
            .then((data) => {
                setCategories((prev) => [...prev, data.data]);
                if (dispatchNotification) {
                    dispatchNotification(
                        GenerateNotificationAddAction(
                            v4(),
                            NotificationType.SUCCESS,
                            `You have created a category with the name: ${data.data.name}`
                        )
                    );
                }
                if (removeMode) toggleRemoveMode();
            })
            .catch((e) => handleAxiosError(dispatchNotification, e));
    });

    const removeCategory = useMutation((uid: string) => {
        return axios
            .delete(`/api/inventory/${uid}`)
            .then((data) => {
                setCategories((prev) => {
                    const newArr = prev.filter((x) => x.id !== uid);
                    if (newArr.length === 0 && removeMode) setRemoveMode(false);

                    return newArr;
                });

                if (dispatchNotification)
                    dispatchNotification(
                        GenerateNotificationAddAction(
                            v4(),
                            NotificationType.SUCCESS,
                            data.data.message
                        )
                    );
            })
            .catch((e) => handleAxiosError(dispatchNotification, e));
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

        getAndSetCategories.mutate();
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

    const generateCategories = () =>
        categories.map((category) => (
            <CategoryCard
                key={category.id}
                name={category.name}
                uid={category.id}
                removeMode={removeMode}
                onRemove={() => removeCategory.mutate(category.id)}
            />
        ));

    const [removeMode, setRemoveMode] = useState(false);
    const toggleRemoveMode = () => {
        setRemoveMode((prev) => !prev);
    };

    return (
        <Layout
            title="Inventory"
            authenticated={userData && Object.keys(userData).length > 0}
            pageTitle="Inventory"
        >
            <div>
                {/*Categories Div*/}
                <div className="w-full">
                    <h3 className="text-4xl text-neutral-700 dark:text-green-400 font-bold self-center pointer-events-none mb-4">
                        Categories
                    </h3>
                    <DashboardSection>
                        <div className="flex gap-4">
                            <Button
                                onClick={() => {
                                    if (!dispatchModal) return;
                                    const modalID = v4();
                                    dispatchModal(
                                        GenerateGenericModalAddAction(
                                            modalID,
                                            "What would you like this new category to be called?",
                                            "➕ Add A Category",
                                            <div>
                                                <Form
                                                    onSubmit={(e) => {
                                                        dispatchModal(
                                                            GenerateGenericModalRemoveAction(
                                                                modalID
                                                            )
                                                        );
                                                        addCategory.mutate({
                                                            id: v4(),
                                                            name: e.newCategoryName,
                                                            index: 0,
                                                            stock: [],
                                                        });
                                                    }}
                                                    render={({
                                                        handleSubmit,
                                                        form,
                                                        submitting,
                                                        pristine,
                                                        values,
                                                    }) => (
                                                        <form
                                                            onSubmit={
                                                                handleSubmit
                                                            }
                                                        >
                                                            <div className="flex flex-col justify-center items-center gap-4">
                                                                <Field
                                                                    name="newCategoryName"
                                                                    component="input"
                                                                    type="text"
                                                                    placeholder="Category name..."
                                                                />
                                                                <Button
                                                                    type={
                                                                        ButtonType.PRIMARY
                                                                    }
                                                                    submitButton={
                                                                        true
                                                                    }
                                                                    isDisabled={
                                                                        submitting ||
                                                                        pristine
                                                                    }
                                                                    isWorking={
                                                                        submitting
                                                                    }
                                                                />
                                                            </div>
                                                        </form>
                                                    )}
                                                />
                                            </div>
                                        )
                                    );
                                }}
                                type={ButtonType.SECONDARY}
                                label="Add a category"
                            />
                            <Button
                                onClick={() => {
                                    if (categories.length === 0) {
                                        if (dispatchNotification) {
                                            dispatchNotification(
                                                GenerateNotificationAddAction(
                                                    v4(),
                                                    NotificationType.ERROR,
                                                    "There are no categories to remove!"
                                                )
                                            );
                                        }
                                        return;
                                    }

                                    toggleRemoveMode();
                                }}
                                type={ButtonType.DANGER_SECONDARY}
                                label={
                                    removeMode
                                        ? "Exit Remove Mode"
                                        : "Remove a category"
                                }
                            />
                        </div>
                    </DashboardSection>
                    <DashboardSection>
                        {getAndSetCategories.isLoading ? (
                            <div className='flex justify-center'>
                                <Spinner size={3} />
                            </div>
                        ) : categories.length !== 0 ? (
                            <div className="grid grid-cols-4 gap-y-5 gap-x-5">
                                {generateCategories()}
                            </div>
                        ) : (
                            <div>
                                <p className="text-center text-4xl text-neutral-300 dark:text-neutral-700 m-12 pointer-events-none">
                                    There&apos;s nothing here yet...
                                </p>
                            </div>
                        )}
                    </DashboardSection>
                </div>
            </div>
        </Layout>
    );
};

export default Index;
