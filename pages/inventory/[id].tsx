import { GetServerSideProps, NextPage } from "next";
import axios from "axios";
import {
    InventoryCategoryObject,
    StockItem,
} from "../../types/InventoryCategoryObject";
import { useContext, useEffect, useState } from "react";
import { useMutation } from "react-query";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import Layout from "../../components/Layout";
import {
    handleAxiosError,
    removeModal,
    sendModal,
    sendNotification,
} from "../../utils/GeneralUtils";
import Button from "../../components/button/Button";
import { ButtonType } from "../../types/ButtonType";
import { ModalContext } from "../../components/modals/ModalProvider";
import {
    GenerateGenericModalAddAction,
    GenerateGenericModalRemoveAction,
} from "../../components/modals/ModalTypes";
import { v4 } from "uuid";
import { Field, Form } from "react-final-form";
import { NotificationContext } from "../../components/notifications/NotificationProvider";
import { NotificationType } from "../../types/NotificationType";
import Table from "../../components/table/Table";
import TableRow from "../../components/table/TableRow";
import TableHeader from "../../components/table/TableHeader";
import TableDataCell from "../../components/table/TableDataCell";
import DashboardSection from "../../components/dashboard/DashboardSection";
import Image from "next/image";
import { Tooltip } from "flowbite-react";
import ButtonDropDownItem from "../../components/button/ButtonDropDownItem";
import Link from "next/link";

type Props = {
    id: string;
};

enum SortMode {
    NAME_ASC,
    NAME_DESC,
    QUANTITY_ASC,
    QUANTITY_DESC,
    NONE,
}

// @ts-ignore
const InventoryCategoryPage: NextPage = (props: Props) => {
    const router = useRouter();
    // @ts-ignore
    const userData = useSelector((state) => state.userData.value);
    // @ts-ignore
    const darkMode = useSelector((state) => state.darkMode.value);
    const dispatchModal = useContext(ModalContext);
    const dispatchNotification = useContext(NotificationContext);
    const [sortMode, setSortMode] = useState(SortMode.NONE);

    const placeHolder: InventoryCategoryObject = {
        id: "",
        name: "",
        index: 0,
        stock: [],
    };
    const [categoryInfo, setCategoryInfo] = useState(placeHolder);

    const placeHolder2:
        | { id: string; name: string; stock: StockItem[] }
        | undefined = undefined;
    const [lowStock, setLowStock] = useState(placeHolder2);

    const getAndSetCategoryInfo = useMutation(() => {
        return axios
            .get(`/api/inventory/${props.id}`)
            .then((data) => setCategoryInfo(data.data))
            .catch(() => {
                // @ts-ignore
                return setCategoryInfo(null);
            });
    });

    const getAndSetLowStock = useMutation(() => {
        return axios
            .get(`/api/inventory/lowstock/${props.id}`)
            .then((data) =>
                setLowStock(data.data.stock.length !== 0 ? data.data : null)
            )
            .catch((e) => handleAxiosError(dispatchNotification, e));
    });

    const itemIsLowStock = (item: StockItem): boolean => {
        if (!lowStock) return false;
        // @ts-ignore
        return lowStock.stock.some((e: StockItem) => e.uid === item.uid);
    };

    const addItem = useMutation((item: StockItem) => {
        return axios
            .put(`/api/inventory/${props.id}`, item)
            .then((data) => {
                setCategoryInfo(data.data);
                updateSort();
                sendNotification(
                    dispatchNotification,
                    NotificationType.SUCCESS,
                    `You have successfully added ${item.name} as a new item!`
                );
                getAndSetLowStock.mutate();
            })
            .catch((e) => handleAxiosError(dispatchNotification, e));
    });

    const updateItem = useMutation((item: StockItem) => {
        return axios
            .patch(`/api/inventory/${props.id}`, {
                stock: [...categoryInfo.stock, item],
            })
            .then((data) => {
                setCategoryInfo(data.data);
                updateSort();
                sendNotification(
                    dispatchNotification,
                    NotificationType.SUCCESS,
                    `You have successfully added ${item.name} as a new item!`
                );
                getAndSetLowStock.mutate();
            })
            .catch((e) => handleAxiosError(dispatchNotification, e));
    });

    const removeItem = useMutation((uid: string) => {
        const item = categoryInfo.stock.filter((x) => x.uid === uid);
        if (item.length === 0)
            return axios
                .get("/api/crash")
                .catch(() =>
                    sendNotification(
                        dispatchNotification,
                        NotificationType.ERROR,
                        `There is no item with ID "${uid}"`
                    )
                );
        const newStock = categoryInfo.stock.filter((x) => x.uid !== uid);
        return axios
            .patch(`/api/inventory/${props.id}`, {
                stock: [...newStock],
            })
            .then((data) => {
                setCategoryInfo(data.data);
                sendNotification(
                    dispatchNotification,
                    NotificationType.SUCCESS,
                    `You have successfully removed ${item[0].name} as an item!`
                );
                getAndSetLowStock.mutate();
            });
    });

    const increaseStock = useMutation(
        (stockObj: { stockId: string; count: number }) => {
            const item = categoryInfo.stock.filter(
                (x) => x.uid === stockObj.stockId
            );
            if (item.length === 0)
                return axios
                    .get("/api/crash")
                    .catch(() =>
                        sendNotification(
                            dispatchNotification,
                            NotificationType.ERROR,
                            `There is no item with ID "${stockObj.stockId}"`
                        )
                    );

            item[0].quantity += stockObj.count;

            // @ts-ignore
            const newStock = categoryInfo.stock.map((x) =>
                x.uid === stockObj.stockId ? item[0] : x
            );
            return axios
                .patch(`/api/inventory/${props.id}`, {
                    stock: [...newStock],
                })
                .then((data) => {
                    setCategoryInfo(data.data);
                    updateSort();
                    sendNotification(
                        dispatchNotification,
                        NotificationType.SUCCESS,
                        `You have successfully added ${stockObj.count} stock${
                            stockObj.count > 1 ? "s" : ""
                        } to ${item[0].name}`
                    );
                    getAndSetLowStock.mutate();
                })
                .catch((e) => handleAxiosError(dispatchNotification, e));
        }
    );

    const decreaseStock = useMutation(
        (stockObj: { stockId: string; count: number }) => {
            const item = categoryInfo.stock.filter(
                (x) => x.uid === stockObj.stockId
            );
            if (item.length === 0)
                return axios
                    .get("/api/crash")
                    .catch(() =>
                        sendNotification(
                            dispatchNotification,
                            NotificationType.ERROR,
                            `There is no item with ID "${stockObj.stockId}"`
                        )
                    );

            item[0].quantity -= stockObj.count;

            // @ts-ignore
            const newStock = categoryInfo.stock.map((x) =>
                x.uid === stockObj.stockId ? item[0] : x
            );
            return axios
                .patch(`/api/inventory/${props.id}`, {
                    stock: [...newStock],
                })
                .then((data) => {
                    setCategoryInfo(data.data);
                    updateSort();
                    sendNotification(
                        dispatchNotification,
                        NotificationType.SUCCESS,
                        `You have successfully removed ${stockObj.count} stock${
                            stockObj.count > 1 ? "s" : ""
                        } from ${item[0].name}`
                    );
                    getAndSetLowStock.mutate();
                })
                .catch((e) => handleAxiosError(dispatchNotification, e));
        }
    );

    useEffect(() => {
        if (!userData) {
            router.push("/");
            return;
        }

        if (Object.keys(userData).length == 0) {
            router.push("/");
            return;
        }

        getAndSetCategoryInfo.mutate();
        getAndSetLowStock.mutate();
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
        if (!categoryInfo) {
            router.push("/inventory");
            return;
        }
    }, [categoryInfo]);

    useEffect(() => {
        if (!categoryInfo) return;

        if (Object.keys(categoryInfo).length === 0) return;

        updateSort();
    }, [sortMode]);

    const updateSort = () => {
        switch (sortMode) {
            case SortMode.NAME_ASC: {
                setCategoryInfo((prev) => ({
                    ...prev,
                    stock: prev.stock.sort((a, b) =>
                        a.name.localeCompare(b.name)
                    ),
                }));
                return;
            }
            case SortMode.NAME_DESC: {
                setCategoryInfo((prev) => ({
                    ...prev,
                    stock: prev.stock.sort((a, b) =>
                        b.name.localeCompare(a.name)
                    ),
                }));
                return;
            }
            case SortMode.QUANTITY_ASC: {
                setCategoryInfo((prev) => ({
                    ...prev,
                    stock: prev.stock.sort((a, b) => a.quantity - b.quantity),
                }));
                return;
            }
            case SortMode.QUANTITY_DESC: {
                setCategoryInfo((prev) => ({
                    ...prev,
                    stock: prev.stock.sort((a, b) => b.quantity - a.quantity),
                }));
                return;
            }
            case SortMode.NONE: {
                getAndSetCategoryInfo.mutate();
                return;
            }
        }
    };

    const generateTableRows = () => {
        return categoryInfo.stock.map((item) => (
            <TableRow key={item.uid} id={item.uid}>
                <TableDataCell>
                    <div className="flex gap-4">
                        {itemIsLowStock(item) && (
                            <div className='self-center'>
                                <Tooltip
                                    content="Low stock"
                                    style={darkMode ? "dark" : "light"}
                                >
                                    <div className="relative w-4 h-4 self-center">
                                        <Image
                                            src="https://i.imgur.com/gGwEe5j.png"
                                            alt=""
                                            fill={true}
                                        />
                                    </div>
                                </Tooltip>
                            </div>
                        )}{" "}
                        {item.name}
                    </div>
                </TableDataCell>
                <TableDataCell>{item.quantity}</TableDataCell>
                <TableDataCell>
                    <div className="flex gap-4 justify-center">
                        <Button
                            className='phone:hidden'
                            type={ButtonType.PRIMARY}
                            label="+1"
                            onClick={() => {
                                increaseStock.mutate({
                                    stockId: item.uid,
                                    count: 1,
                                });
                            }}
                            width={4}
                            height={3}
                        />
                        <Button
                            className='phone:hidden'
                            type={ButtonType.DANGER}
                            label="-1"
                            onClick={() => {
                                if (item.quantity === 0)
                                    return sendNotification(
                                        dispatchNotification,
                                        NotificationType.ERROR,
                                        `You cannot decrement any more stock for ${item.name}`
                                    );
                                decreaseStock.mutate({
                                    stockId: item.uid,
                                    count: 1,
                                });
                            }}
                            width={4}
                            height={3}
                        />
                        <Button
                            type={ButtonType.SECONDARY}
                            icon="https://i.imgur.com/YpjxUaa.png"
                            height={3}
                            width={4}
                        >
                            <ButtonDropDownItem
                                label="Add Multiple Stocks"
                                onClick={() => {
                                    const modalID = v4();
                                    sendModal(
                                        dispatchModal,
                                        modalID,
                                        "Add Stock",
                                        `How many stocks would you like to add to ${item.name}?`,
                                        <div>
                                            <Form
                                                onSubmit={(values) => {
                                                    let count = values.count;
                                                    if (isNaN(count))
                                                        return sendNotification(
                                                            dispatchNotification,
                                                            NotificationType.ERROR,
                                                            "The count must be an integer!"
                                                        );

                                                    count = Number(
                                                        values.count
                                                    );
                                                    if (count <= 0)
                                                        return sendNotification(
                                                            dispatchNotification,
                                                            NotificationType.ERROR,
                                                            "The count must be a positive integer!"
                                                        );

                                                    increaseStock.mutate({
                                                        stockId: item.uid,
                                                        count: Number(
                                                            values.count
                                                        ),
                                                    });
                                                    removeModal(
                                                        dispatchModal,
                                                        modalID
                                                    );
                                                }}
                                                render={({
                                                    handleSubmit,
                                                    pristine,
                                                }) => (
                                                    <form
                                                        onSubmit={handleSubmit}
                                                    >
                                                        <div className="flex flex-col justify-center items-center gap-4">
                                                            <Field
                                                                name="count"
                                                                component="input"
                                                                type="text"
                                                                placeholder="Stock count..."
                                                            />
                                                            <Button
                                                                type={
                                                                    ButtonType.PRIMARY
                                                                }
                                                                submitButton={
                                                                    true
                                                                }
                                                                isDisabled={
                                                                    pristine
                                                                }
                                                            />
                                                        </div>
                                                    </form>
                                                )}
                                            />
                                        </div>
                                    );
                                }}
                            />
                            <ButtonDropDownItem
                                label="Remove Multiple Stocks"
                                onClick={() => {
                                    const modalID = v4();
                                    sendModal(
                                        dispatchModal,
                                        modalID,
                                        "Remove Stock",
                                        `How many stocks would you like to remove from ${item.name}?`,
                                        <div>
                                            <Form
                                                onSubmit={(values) => {
                                                    let count = values.count;
                                                    if (isNaN(count))
                                                        return sendNotification(
                                                            dispatchNotification,
                                                            NotificationType.ERROR,
                                                            "The count must be an integer!"
                                                        );

                                                    count = Number(
                                                        values.count
                                                    );
                                                    if (count <= 0)
                                                        return sendNotification(
                                                            dispatchNotification,
                                                            NotificationType.ERROR,
                                                            "The count must be a positive integer!"
                                                        );

                                                    if (count > item.quantity)
                                                        return sendNotification(
                                                            dispatchNotification,
                                                            NotificationType.ERROR,
                                                            "You cannot remove more stocks than available!"
                                                        );

                                                    decreaseStock.mutate({
                                                        stockId: item.uid,
                                                        count: count,
                                                    });
                                                    removeModal(
                                                        dispatchModal,
                                                        modalID
                                                    );
                                                }}
                                                render={({
                                                    handleSubmit,
                                                    pristine,
                                                }) => (
                                                    <form
                                                        onSubmit={handleSubmit}
                                                    >
                                                        <div className="flex flex-col justify-center items-center gap-4">
                                                            <Field
                                                                name="count"
                                                                component="input"
                                                                type="text"
                                                                placeholder="Stock count..."
                                                            />
                                                            <Button
                                                                type={
                                                                    ButtonType.PRIMARY
                                                                }
                                                                submitButton={
                                                                    true
                                                                }
                                                                isDisabled={
                                                                    pristine
                                                                }
                                                            />
                                                        </div>
                                                    </form>
                                                )}
                                            />
                                        </div>
                                    );
                                }}
                            />
                            <ButtonDropDownItem
                                label="Delete Stock"
                                icon="https://i.imgur.com/wvi6Bge.png"
                                onClick={() => removeItem.mutate(item.uid)}
                            />
                        </Button>
                    </div>
                </TableDataCell>
            </TableRow>
        ));
    };

    const generateLowStockElements = () => {
        if (!lowStock) return;
        // @ts-ignore
        return lowStock.stock.map((item: StockItem) => (
            <Link key={item.uid} href={`#${item.uid}`}>
                <div className="cursor-pointer transition-faster flex justify-between bg-green-300/50 dark:bg-green-600/50 backdrop-blur-xl py-2 px-4 rounded-xl mb-3 w-full text-white text-[1.15rem]">
                    <p className="self-center">{item.name}</p>
                    <div className="self-center bg-red-600/80 rounded-full px-2 h-fit">
                        <p>{item.quantity}</p>
                    </div>
                </div>
            </Link>
        ));
    };

    return (
        <Layout
            authenticated={userData && Object.keys(userData).length > 0}
            title={categoryInfo ? categoryInfo.name : undefined}
            pageTitle={
                <p>
                    Inventory -{" "}
                    <span className="text-green-400 dark:text-green-500">
                        {categoryInfo.name}
                    </span>
                </p>
            }
        >
            {categoryInfo && (
                <div>
                    <DashboardSection>
                        <Button
                            type={ButtonType.SECONDARY}
                            icon="https://i.imgur.com/51nLXl9.png"
                            label="Add an item"
                            onClick={() => {
                                const modalID = v4();
                                if (dispatchModal)
                                    dispatchModal(
                                        GenerateGenericModalAddAction(
                                            modalID,
                                            "What is the name of the item you would like to add? ",
                                            "➕ Add an item",
                                            <div>
                                                <Form
                                                    onSubmit={(values) => {
                                                        addItem.mutate({
                                                            uid: v4(),
                                                            name: values.itemName,
                                                            quantity: 0,
                                                            lastUpdated:
                                                                new Date().getTime(),
                                                        });

                                                        if (dispatchModal)
                                                            dispatchModal(
                                                                GenerateGenericModalRemoveAction(
                                                                    modalID
                                                                )
                                                            );
                                                    }}
                                                    render={({
                                                        handleSubmit,
                                                        form,
                                                        pristine,
                                                        submitting,
                                                    }) => (
                                                        <form
                                                            onSubmit={
                                                                handleSubmit
                                                            }
                                                        >
                                                            <div className="flex flex-col justify-center items-center gap-4">
                                                                <Field
                                                                    name="itemName"
                                                                    component="input"
                                                                    type="text"
                                                                    placeholder="Item name..."
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
                        />
                    </DashboardSection>
                    {lowStock && (
                        <DashboardSection title="Low Stock">
                            <div className="grid grid-cols-3 tablet:grid-cols-2 phone:grid-cols-1 gap-x-4 transition-faster border-[1px] border-white/30 bg-green-400 dark:bg-green-500 shadow-md w-5/6 p-6 rounded-md">
                                {generateLowStockElements()}
                            </div>
                        </DashboardSection>
                    )}
                    <DashboardSection>
                        {categoryInfo.stock.length > 0 ? (
                            <Table>
                                <thead>
                                    <TableRow isHeading={true}>
                                        <TableHeader
                                            className="border-opacity-100 text-center p-2 justify-center bg-green-300 dark:bg-green-500"
                                            title="Item"
                                            onClick={() => {
                                                if (
                                                    sortMode ===
                                                    SortMode.NAME_DESC
                                                )
                                                    setSortMode(SortMode.NONE);
                                                else if (
                                                    sortMode ===
                                                    SortMode.NAME_ASC
                                                )
                                                    setSortMode(
                                                        SortMode.NAME_DESC
                                                    );
                                                else
                                                    setSortMode(
                                                        SortMode.NAME_ASC
                                                    );
                                            }}
                                            sortMode={
                                                sortMode === SortMode.NAME_ASC
                                                    ? "1"
                                                    : sortMode ===
                                                      SortMode.NAME_DESC
                                                    ? "2"
                                                    : "0"
                                            }
                                        />
                                        <TableHeader
                                            className="border-opacity-100 text-center p-6 justify-center bg-green-300 dark:bg-green-500"
                                            title="Quantity"
                                            onClick={() => {
                                                if (
                                                    sortMode ===
                                                    SortMode.QUANTITY_DESC
                                                )
                                                    setSortMode(SortMode.NONE);
                                                else if (
                                                    sortMode ===
                                                    SortMode.QUANTITY_ASC
                                                )
                                                    setSortMode(
                                                        SortMode.QUANTITY_DESC
                                                    );
                                                else
                                                    setSortMode(
                                                        SortMode.QUANTITY_ASC
                                                    );
                                            }}
                                            sortMode={
                                                sortMode ===
                                                SortMode.QUANTITY_ASC
                                                    ? "1"
                                                    : sortMode ===
                                                      SortMode.QUANTITY_DESC
                                                    ? "2"
                                                    : "0"
                                            }
                                        />
                                        <TableHeader
                                            className="border-opacity-100 text-center p-6 justify-center bg-green-300 dark:bg-green-500"
                                            title="Action"
                                        />
                                    </TableRow>
                                </thead>
                                <tbody>{generateTableRows()}</tbody>
                            </Table>
                        ) : (
                            <p className="text-center text-4xl text-neutral-300 dark:text-neutral-700 m-12 pointer-events-none">
                                There&apos;s nothing here yet...
                            </p>
                        )}
                    </DashboardSection>
                </div>
            )}
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    // @ts-ignore
    const { id } = context.params;
    return {
        props: {
            id: id,
        },
    };
};

export default InventoryCategoryPage;
