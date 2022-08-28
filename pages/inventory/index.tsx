import {NextPage} from "next";
import SidebarItem from "../../components/sidebar/SidebarItem";
import Sidebar from "../../components/sidebar/Sidebar";
import {useContext, useEffect, useState} from "react";
import {useRouter} from "next/router";
import Button from "../../components/Button";
import {ButtonType} from "../../types/ButtonType";
import {NotificationContext} from "../../components/notifications/NotificationProvider";
import {InventoryCategoryObject} from "../../types/InventoryCategoryObject";
import {ModalContext} from "../../components/modals/ModalProvider";
import {GenerateGenericModalAddAction, GenerateGenericModalRemoveAction} from "../../components/modals/ModalTypes";
import {v4} from "uuid";
import {useDispatch, useSelector} from "react-redux";
import {toggleSidebarState} from "../../utils/redux/SidebarSlice";
import {Field, Form} from "react-final-form";
import CategoryCard from "../../components/inventory/CategoryCard";
import {GenerateNotificationAddAction} from "../../components/notifications/NotificationTypes";
import {NotificationType} from "../../types/NotificationType";
import Layout from "../../components/Layout";
import {useMutation} from "react-query";
import axios from "axios";
import Image from "next/image";
import {generateDefaultSidebar, handleAxiosError} from "../../utils/GeneralUtils";

// @ts-ignore
const Index: NextPage = () => {
    const router = useRouter();
    // @ts-ignore
    const sidebarOpened = useSelector(state => state.sidebar.value);
    // @ts-ignore
    const userData = useSelector(state => state.userData.value);
    const reduxDispatch = useDispatch();
    const dispatchNotification = useContext(NotificationContext);
    const dispatchModal = useContext(ModalContext);

    let initCategoryState: InventoryCategoryObject[] = [];
    const [ categories, setCategories ] = useState(initCategoryState);

     const getAndSetCategories = useMutation(() => {
         return axios.get('/api/inventory')
             .then(data => {
                 setCategories(data.data);
             });
     })

    const addCategory = useMutation((categoryInfo: InventoryCategoryObject) => {
        return axios.post('/api/inventory', categoryInfo)
            .then(data => {
                setCategories(prev => [...prev, data.data]);
                if (dispatchNotification) {
                    dispatchNotification(GenerateNotificationAddAction(
                        v4(),
                        NotificationType.SUCCESS,
                        `You have created a category with the name: ${data.data.name}`
                    ))
                }
                if (removeMode)
                    toggleRemoveMode();
            })
            .catch(e => handleAxiosError(dispatchNotification, e))
    });

    const removeCategory = useMutation((uid: string) => {
        return axios.delete(`/api/inventory/${uid}`)
            .then(data => {
                setCategories(prev => {

                    const newArr = prev.filter(x => x.id !== uid);
                    if (newArr.length === 0 && removeMode)
                        setRemoveMode(false);

                    return newArr;
                });

                if (dispatchNotification)
                    dispatchNotification(GenerateNotificationAddAction(
                        v4(),
                        NotificationType.SUCCESS,
                        data.data.message
                    ));
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

        getAndSetCategories.mutate();
    }, [])

    useEffect(() => {
        if (!userData) {
            router.push('/');
            return;
        }

        if (Object.keys(userData).length == 0) {
            router.push('/');
            return;
        }
    }, [userData])

    const generateCategories = () => categories.map(category => <CategoryCard
        key={category.id}
        name={category.name}
        uid={category.id}
        removeMode={removeMode}
        onRemove={() => removeCategory.mutate(category.id)}
    />);

    const [ removeMode, setRemoveMode ] = useState(false);
    const toggleRemoveMode = () => {
        setRemoveMode(prev => !prev);
    }

    return (
        <Layout title='Inventory'>
            <main className='flex dark:bg-neutral-800 transition-fast'>
                {generateDefaultSidebar(sidebarOpened, reduxDispatch)}
                <div className='pl-8 pt-16 w-full'>
                    <h1 className='text-7xl font-bold self-center pointer-events-none mb-12 dark:text-white'>Inventory</h1>
                    {/*Categories Div*/}
                    <div className='w-full'>
                        <h3 className='text-4xl text-neutral-700 dark:text-green-400 font-bold self-center pointer-events-none mb-4'>Categories</h3>
                        <div className='w-3/4 h-full'>
                            <div className='w-full mb-6 border-[1px] border-green-400 border-opacity-20 h-32 rounded-xl shadow-md flex gap-4 items-center px-4'>
                                <Button onClick={() => {
                                    if (!dispatchModal)
                                        return;
                                    const modalID = v4();
                                    dispatchModal(
                                        GenerateGenericModalAddAction(
                                            modalID,
                                            'What would you like this new category to be called?',
                                            '➕ Add A Category',
                                            <div>
                                                <Form
                                                    onSubmit={(e) => {
                                                        dispatchModal(
                                                            GenerateGenericModalRemoveAction(modalID)
                                                        );
                                                        addCategory.mutate({
                                                            id: v4(),
                                                            name: e.newCategoryName,
                                                            index: 0,
                                                            stock: []
                                                        });
                                                    }}
                                                    render={({ handleSubmit, form, submitting, pristine, values }) => (
                                                        <form onSubmit={handleSubmit}>
                                                            <div className='flex flex-col justify-center items-center gap-4'>
                                                                <Field
                                                                    name='newCategoryName'
                                                                    component='input'
                                                                    type='text'
                                                                    placeholder='Category name...'
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
                                        )
                                    )
                                }} type={ButtonType.SECONDARY} label='Add a category' />
                                <Button onClick={() => {
                                    if (categories.length === 0) {
                                        if (dispatchNotification) {
                                            dispatchNotification(GenerateNotificationAddAction(
                                                v4(),
                                                NotificationType.ERROR,
                                                'There are no categories to remove!'
                                            ))
                                        }
                                        return;
                                    }

                                    toggleRemoveMode();
                                }} type={ButtonType.DANGER_SECONDARY} label={removeMode ? 'Exit Remove Mode' : 'Remove a category'} />
                            </div>
                            <div className='w-full border-[1px] border-green-400 border-opacity-20 rounded-xl shadow-md p-6'>
                                {
                                    getAndSetCategories.isLoading ?
                                        <div className='m-12'>
                                            <div className='mx-auto animate-spin relative w-24 h-24 brightness-50 opacity-20'>
                                                <Image src='https://i.imgur.com/oQkKuvH.png' alt='' layout='fill' />
                                            </div>
                                        </div>
                                        :
                                        categories.length !== 0 ?
                                            <div className='grid grid-cols-4 gap-y-5 gap-x-5'>
                                                {generateCategories()}
                                            </div>
                                            :
                                            <div>
                                                <p className='text-center text-4xl text-neutral-300 dark:text-neutral-700 m-12 pointer-events-none'>There&apos;s nothing here yet...</p>
                                            </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </Layout>
    )
}

export default Index;