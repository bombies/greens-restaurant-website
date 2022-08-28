import {GetServerSideProps, NextPage} from "next";
import axios from "axios";
import {InventoryCategoryObject, StockItem} from "../../types/InventoryCategoryObject";
import {useContext, useEffect, useState} from "react";
import {useMutation} from "react-query";
import {useRouter} from "next/router";
import {useDispatch, useSelector} from "react-redux";
import Layout from "../../components/Layout";
import {
    generateDefaultSidebar,
    handleAxiosError,
    removeModal,
    sendModal,
    sendNotification
} from "../../utils/GeneralUtils";
import Button from "../../components/Button";
import {ButtonType} from "../../types/ButtonType";
import {ModalContext} from "../../components/modals/ModalProvider";
import {GenerateGenericModalAddAction, GenerateGenericModalRemoveAction} from "../../components/modals/ModalTypes";
import {v4} from "uuid";
import {Field, Form} from "react-final-form";
import {NotificationContext} from "../../components/notifications/NotificationProvider";
import {NotificationType} from "../../types/NotificationType";
import Table from "../../components/table/Table";
import TableRow from "../../components/table/TableRow";
import TableHeader from "../../components/table/TableHeader";
import TableDataCell from "../../components/table/TableDataCell";

type Props = {
    id: string
}

enum SortMode {
    NAME_ASC,
    NAME_DESC,
    QUANTITY_ASC,
    QUANTITY_DESC,
    NONE
}

// @ts-ignore
const InventoryCategoryPage: NextPage = (props: Props) => {
    const router = useRouter();
    // @ts-ignore
    const userData = useSelector(state => state.userData.value);
    // @ts-ignore
    const sidebarOpened = useSelector(state => state.sidebar.value);
    const dispatchModal = useContext(ModalContext);
    const dispatchNotification = useContext(NotificationContext);
    const reduxDispatch = useDispatch();
    const [ sortMode, setSortMode ] = useState(SortMode.NONE);

    const placeHolder: InventoryCategoryObject = {
        id: '',
        name: '',
        index: 0,
        stock: []
    };
    const [ categoryInfo, setCategoryInfo ] = useState(placeHolder);

    const getAndSetCategoryInfo = useMutation(() => {
        return axios.get(`/api/inventory/${props.id}`)
            .then(data => setCategoryInfo(data.data))
            .catch(() => {
                // @ts-ignore
                return setCategoryInfo(null);
            })
    });

    const addItem = useMutation((item: StockItem) => {
        return axios.patch(`/api/inventory/${props.id}`, {
            stock: [...categoryInfo.stock, item]
        })
            .then(data => {
                setCategoryInfo(data.data);
                sendNotification(
                    dispatchNotification,
                    NotificationType.SUCCESS,
                    `You have successfully added ${item.name} as a new item!`
                )
            })
            .catch(e => handleAxiosError(dispatchNotification, e));
    });

    const removeItem = useMutation((uid: string) => {
        const item = categoryInfo.stock.filter(x => x.uid === uid);
        if (item.length === 0)
            return axios.get('/api/crash')
                .catch(() => sendNotification(
                    dispatchNotification,
                    NotificationType.ERROR,
                    `There is no item with ID "${uid}"`
                ));
        const newStock = categoryInfo.stock.filter(x => x.uid !== uid);
        return axios.patch(`/api/inventory/${props.id}`, {
            stock: [...newStock]
        })
            .then(data => {
                setCategoryInfo(data.data);
                sendNotification(
                    dispatchNotification,
                    NotificationType.SUCCESS,
                    `You have successfully removed ${item[0].name} as an item!`
                )
            })
    });

    const increaseStock = useMutation((stockObj: { stockId: string, count: number }) => {
        const item = categoryInfo.stock.filter(x => x.uid === stockObj.stockId);
        if (item.length === 0)
            return axios.get('/api/crash')
                .catch(() => sendNotification(
                    dispatchNotification,
                    NotificationType.ERROR,
                    `There is no item with ID "${stockObj.stockId}"`
                ));

        item[0].quantity += stockObj.count;

        // @ts-ignore
        const newStock = categoryInfo.stock.map(x => x.uid === stockObj.stockId ? item[0] : x);
        return axios.patch(`/api/inventory/${props.id}`, {
            stock: [...newStock]
        })
            .then(data => {
                setCategoryInfo(data.data);
                updateSort();
                sendNotification(
                    dispatchNotification,
                    NotificationType.SUCCESS,
                    `You have successfully added ${stockObj.count} stocks to ${item[0].name}`
                )
            })
            .catch(e => handleAxiosError(dispatchNotification, e))
    });

    const decreaseStock = useMutation((stockObj: { stockId: string, count: number }) => {
        const item = categoryInfo.stock.filter(x => x.uid === stockObj.stockId);
        if (item.length === 0)
            return axios.get('/api/crash')
                .catch(() => sendNotification(
                    dispatchNotification,
                    NotificationType.ERROR,
                    `There is no item with ID "${stockObj.stockId}"`
                ));

        item[0].quantity -= stockObj.count;

        // @ts-ignore
        const newStock = categoryInfo.stock.map(x => x.uid === stockObj.stockId ? item[0] : x);
        return axios.patch(`/api/inventory/${props.id}`, {
            stock: [...newStock]
        })
            .then(data => {
                setCategoryInfo(data.data);
                updateSort();
                sendNotification(
                    dispatchNotification,
                    NotificationType.SUCCESS,
                    `You have successfully removed ${stockObj.count} stocks from ${item[0].name}`
                )
            })
            .catch(e => handleAxiosError(dispatchNotification, e))
    });

    useEffect(() => {
        if (!userData) {
            router.push('/');
            return;
        }

        if (Object.keys(userData).length == 0) {
            router.push('/');
            return;
        }

        getAndSetCategoryInfo.mutate();
    }, []);

    useEffect(() => {
        if (!userData) {
            router.push('/');
            return;
        }

        if (Object.keys(userData).length == 0) {
            router.push('/');
            return;
        }
    }, [userData]);

    useEffect(() => {
        if (!categoryInfo) {
            router.push('/inventory');
            return;
        }
    }, [categoryInfo]);

    useEffect(() => {
        if (!categoryInfo)
            return;

        if (Object.keys(categoryInfo).length === 0)
            return;

        updateSort();

    }, [sortMode]);

    const updateSort = () => {
        switch (sortMode) {
            case SortMode.NAME_ASC: {
                setCategoryInfo(prev => ({...prev, stock: prev.stock.sort((a, b) => a.name.localeCompare(b.name))}));
                return;
            }
            case SortMode.NAME_DESC: {
                setCategoryInfo(prev => ({...prev, stock: prev.stock.sort((a, b) => b.name.localeCompare(a.name))}));
                return;
            }
            case SortMode.QUANTITY_ASC: {
                setCategoryInfo(prev => ({...prev, stock: prev.stock.sort((a, b) => a.quantity - b.quantity)}));
                return;
            }
            case SortMode.QUANTITY_DESC: {
                setCategoryInfo(prev => ({...prev, stock: prev.stock.sort((a, b) => b.quantity - a.quantity)}));
                return;
            }
            case SortMode.NONE: {
                getAndSetCategoryInfo.mutate();
                return;
            }
        }
    }

    const generateTableRows = () => {
        return categoryInfo.stock.map(item => (
            <TableRow key={item.uid}>
                <TableDataCell>{item.name}</TableDataCell>
                <TableDataCell>{item.quantity}</TableDataCell>
                <TableDataCell>
                    <div className='flex gap-4 justify-center'>
                        <Button
                            type={ButtonType.PRIMARY}
                            label='Add Stock'
                            width={11} height={3}
                            onClick={() => {
                                const modalID = v4();
                                sendModal(
                                    dispatchModal,
                                    modalID,
                                    "Add Stock",
                                    `How many stocks would you like to add to ${item.name}?`,
                                    <div>
                                        <Form
                                            onSubmit={values => {
                                                let count = values.count;
                                                if (isNaN(count))
                                                    return sendNotification(
                                                        dispatchNotification,
                                                        NotificationType.ERROR,
                                                        'The count must be an integer!'
                                                    );


                                                count = Number(values.count);
                                                if (count <= 0)
                                                    return sendNotification(
                                                        dispatchNotification,
                                                        NotificationType.ERROR,
                                                        'The count must be a positive integer!'
                                                    );

                                                increaseStock.mutate({ stockId: item.uid, count: Number(values.count) })
                                                removeModal(dispatchModal, modalID);
                                            }}
                                            render={({ handleSubmit, pristine }) => (
                                                <form onSubmit={handleSubmit}>
                                                    <div className='flex flex-col justify-center items-center gap-4'>
                                                        <Field
                                                            name='count'
                                                            component='input'
                                                            type='text'
                                                            placeholder='Stock count...'
                                                        />
                                                        <Button
                                                            type={ButtonType.PRIMARY}
                                                            submitButton={true}
                                                            isDisabled={pristine}
                                                        />
                                                    </div>
                                                </form>
                                            )}
                                        />
                                    </div>
                                )
                            }}
                        />
                        <Button
                            type={ButtonType.DANGER}
                            label='Remove Stock'
                            width={11} height={3}
                            onClick={() => {
                                const modalID = v4();
                                sendModal(
                                    dispatchModal,
                                    modalID,
                                    "Remove Stock",
                                    `How many stocks would you like to remove from ${item.name}?`,
                                    <div>
                                        <Form
                                            onSubmit={values => {
                                                let count = values.count;
                                                if (isNaN(count))
                                                    return sendNotification(
                                                        dispatchNotification,
                                                        NotificationType.ERROR,
                                                        'The count must be an integer!'
                                                    );


                                                count = Number(values.count);
                                                if (count <= 0)
                                                    return sendNotification(
                                                        dispatchNotification,
                                                        NotificationType.ERROR,
                                                        'The count must be a positive integer!'
                                                    );

                                                if (count > item.quantity)
                                                    return sendNotification(
                                                        dispatchNotification,
                                                        NotificationType.ERROR,
                                                        'You cannot remove more stocks than available!'
                                                    )

                                                decreaseStock.mutate({ stockId: item.uid, count: count })
                                                removeModal(dispatchModal, modalID);
                                            }}
                                            render={({ handleSubmit, pristine }) => (
                                                <form onSubmit={handleSubmit}>
                                                    <div className='flex flex-col justify-center items-center gap-4'>
                                                        <Field
                                                            name='count'
                                                            component='input'
                                                            type='text'
                                                            placeholder='Stock count...'
                                                        />
                                                        <Button
                                                            type={ButtonType.PRIMARY}
                                                            submitButton={true}
                                                            isDisabled={pristine}
                                                        />
                                                    </div>
                                                </form>
                                            )}
                                        />
                                    </div>
                                )
                            }}
                        />
                        <Button
                            type={ButtonType.DANGER_SECONDARY}
                            label='Delete Item'
                            width={11} height={3}
                            onClick={() => removeItem.mutate(item.uid)}
                        />
                    </div>
                </TableDataCell>
            </TableRow>
        ));
    }

    return (
        <Layout title={categoryInfo ? categoryInfo.name : undefined}>
            {
                categoryInfo &&
                <main className='flex dark:bg-neutral-800 transition-fast'>
                    {generateDefaultSidebar(sidebarOpened, reduxDispatch)}
                    <div className='pl-8 pt-16 w-full'>
                        <h1 className='text-7xl font-bold self-center pointer-events-none mb-12 dark:text-white'>Inventory - <span className='text-green-400 dark:text-green-500'>{categoryInfo.name}</span></h1>
                        <div className='w-3/4 border-[1px] border-green-400 border-opacity-20 rounded-xl shadow-md p-6 mb-12 flex'>
                            <Button
                                type={ButtonType.SECONDARY}
                                label='Add an item'
                                onClick={() => {
                                    const modalID = v4();
                                    if (dispatchModal)
                                        dispatchModal(GenerateGenericModalAddAction(
                                            modalID,
                                            'What is the name of the item you would like to add? ',
                                            '➕ Add an item',
                                            <div>
                                                <Form
                                                    onSubmit={values => {
                                                        addItem.mutate({
                                                            uid: v4(),
                                                            name: values.itemName,
                                                            quantity: 0,
                                                            lastUpdated: new Date().getTime()
                                                        })

                                                        if (dispatchModal)
                                                            dispatchModal(GenerateGenericModalRemoveAction(modalID))
                                                    }}
                                                    render={({ handleSubmit, form, pristine, submitting}) => (
                                                        <form onSubmit={handleSubmit}>
                                                            <div className='flex flex-col justify-center items-center gap-4'>
                                                                <Field
                                                                    name='itemName'
                                                                    component='input'
                                                                    type='text'
                                                                    placeholder='Item name...'
                                                                />
                                                                <Button
                                                                    type={ButtonType.PRIMARY}
                                                                    submitButton={true}
                                                                    isDisabled={submitting || pristine}
                                                                    isWorking={submitting}
                                                                />
                                                            </div>
                                                        </form>
                                                    )}
                                                />
                                            </div>
                                        ));
                                }}
                            />
                        </div>
                        <div className='w-3/4 border-[1px] border-green-400 border-opacity-20 rounded-xl shadow-md p-6'>
                            {
                                categoryInfo.stock.length > 0 ?
                                    <Table>
                                        <thead>
                                        <TableRow isHeading={true}>
                                            <TableHeader
                                                className='border-opacity-100 text-center p-6 justify-center bg-green-300 dark:bg-green-500'
                                                title='Item'
                                                onClick={() => {
                                                    if (sortMode === SortMode.NAME_DESC)
                                                        setSortMode(SortMode.NONE)
                                                    else if (sortMode === SortMode.NAME_ASC)
                                                        setSortMode(SortMode.NAME_DESC)
                                                    else
                                                        setSortMode(SortMode.NAME_ASC)
                                                }}
                                                sortMode={sortMode === SortMode.NAME_ASC ? '1' : sortMode === SortMode.NAME_DESC ? '2' : '0'}
                                            />
                                            <TableHeader
                                                className='border-opacity-100 text-center p-6 justify-center bg-green-300 dark:bg-green-500'
                                                title='Quantity'
                                                onClick={() => {
                                                    if (sortMode === SortMode.QUANTITY_DESC)
                                                        setSortMode(SortMode.NONE)
                                                    else if (sortMode === SortMode.QUANTITY_ASC)
                                                        setSortMode(SortMode.QUANTITY_DESC)
                                                    else
                                                        setSortMode(SortMode.QUANTITY_ASC)
                                                }}
                                                sortMode={sortMode === SortMode.QUANTITY_ASC ? '1' : sortMode === SortMode.QUANTITY_DESC ? '2' : '0'}
                                            />
                                            <TableHeader className='border-opacity-100 text-center p-6 justify-center bg-green-300 dark:bg-green-500' title='Action' />
                                        </TableRow>
                                        </thead>
                                        <tbody>
                                            {generateTableRows()}
                                        </tbody>
                                    </Table>
                                    :
                                    <p className='text-center text-4xl text-neutral-300 dark:text-neutral-700 m-12 pointer-events-none'>There&apos;s nothing here yet...</p>
                            }
                        </div>
                    </div>
                </main>
            }
        </Layout>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    // @ts-ignore
    const { id } = context.params;
    return {
        props: {
            id: id
        }
    }
}

export default InventoryCategoryPage;