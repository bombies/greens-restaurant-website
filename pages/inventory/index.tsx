import {GetServerSideProps, GetServerSidePropsContext, NextPage} from "next";
import SidebarItem from "../../components/sidebar/SidebarItem";
import Sidebar from "../../components/sidebar/Sidebar";
import {useContext, useState} from "react";
import {UserData} from "../../types/UserData";
import {useRouter} from "next/router";
import {UserPermissions} from "../../types/UserPermissions";
import Button from "../../components/Button";
import {ButtonType} from "../../types/ButtonType";
import {NotificationContext} from "../../components/notifications/NotificationProvider";
import {InventoryCategory} from "../../types/InventoryCategory";
import {ModalContext} from "../../components/modals/ModalProvider";
import {GenerateGenericModalAddAction, GenerateGenericModalRemoveAction} from "../../components/modals/ModalTypes";
import {v4} from "uuid";
import {useDispatch, useSelector} from "react-redux";
import {toggleSidebarState} from "../../utils/redux/SidebarSlice";
import {Field, Form} from "react-final-form";
import CategoryCard from "../../components/inventory/CategoryCard";
import {GenerateNotificationAddAction} from "../../components/notifications/NotificationTypes";
import {NotificationType} from "../../types/NotificationType";
import Toggle from "../../components/Toggle";
import Layout from "../../components/Layout";

type Props = {
    userData : UserData,
    categories: InventoryCategory[]
}

// @ts-ignore
const Index: NextPage = (props: Props) => {
    const router = useRouter();
    // @ts-ignore
    const sidebarOpened = useSelector(state => state.sidebar.value);
    // @ts-ignore
    const newCategoryName = useSelector(state => state.categoryNameModalInput.value);
    const reduxDispatch = useDispatch();
    const dispatchNotification = useContext(NotificationContext);
    const dispatchModal = useContext(ModalContext);

    const [ categories, setCategories ] = useState(props.categories);
    const addCategory = (category: InventoryCategory) => {
        setCategories(prev => [...prev, category]);
    }

    const removeCategory = (uid: string) => {
        setCategories(prev => prev.filter(x => x.id !== uid))
    }

    const categoriesJSX = categories.map(category => <CategoryCard key={category.id} name={category.name} uid={category.id} />)

    if (!props.userData) {
        router.push('/');
        return <div></div>;
    }

    if (Object.keys(props.userData).length == 0) {
        router.push('/');
        return <div></div>;
    }

    return (
        <Layout title='Inventory'>
            <main className='flex dark:bg-neutral-800'>
                <Sidebar
                    icon='https://i.imgur.com/HLTQ78m.png'
                    color='bg-green-600 dark:bg-green-700'
                    sidebarOpened={sidebarOpened}
                    toggleSidebar={() => reduxDispatch(toggleSidebarState())}
                >
                    <SidebarItem icon='https://i.imgur.com/wZ8e1Lc.png' label='Inventory' link='inventory' sidebarOpened={sidebarOpened} />
                    <SidebarItem icon='https://i.imgur.com/nWxboHU.png' label='Employees' link='employees' sidebarOpened={sidebarOpened} />
                    <SidebarItem icon='https://i.imgur.com/no6wh9w.png' label='Management' link='management' sidebarOpened={sidebarOpened} />
                </Sidebar>
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
                                                        addCategory({
                                                            id: v4(),
                                                            name: e.newCategoryName,
                                                            index: 0,
                                                            stock: []
                                                        })
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
                                                                />
                                                            </div>
                                                        </form>
                                                    )}
                                                />
                                            </div>
                                        )
                                    )
                                }} type={ButtonType.SECONDARY} label='Add a category' />
                                <Button onClick={() => {}} type={ButtonType.DANGER_SECONDARY} label='Remove a category' />
                            </div>
                            <div className='w-full border-[1px] border-green-400 border-opacity-20 rounded-xl shadow-md p-6'>
                                {
                                    categories.length !== 0 ?
                                        <div className='grid grid-cols-4 gap-y-5'>
                                            {categoriesJSX}
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

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    return {
        props: {
            userData: {
                username: 'agreen',
                first_name: 'Ajani',
                last_name: 'Green',
                avatar: null,
                creation_date: new Date().getTime(),
                permissions: UserPermissions.ADMINISTRATOR,
            },
            categories: []
        }
    }
}

export default Index;