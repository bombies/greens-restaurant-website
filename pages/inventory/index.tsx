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
import {GenerateGenericModalAddAction} from "../../components/modals/ModalTypes";
import {v4} from "uuid";
import {useDispatch, useSelector} from "react-redux";
import {toggleSidebarState} from "../../utils/redux/SidebarSlice";
import TextBox from "../../components/TextBox";

type Props = {
    userData : UserData,
    categories: InventoryCategory[]
}

// @ts-ignore
const Index: NextPage = (props: Props) => {
    const router = useRouter();
    // @ts-ignore
    const sidebarOpened = useSelector(state => state.sidebar.value)
    const reduxDispatch = useDispatch();
    const dispatchNotification = useContext(NotificationContext);
    const dispatchModal = useContext(ModalContext);

    const [ newCategoryName, setNewCategoryName ] = useState('');

    if (!props.userData) {
        router.push('/');
        return <div></div>;
    }

    if (Object.keys(props.userData).length == 0) {
        router.push('/');
        return <div></div>;
    }

    return (
        <main className='flex'>
            <Sidebar
                icon='https://i.imgur.com/V2taHx1.png'
                color='bg-green-600'
                sidebarOpened={sidebarOpened}
                toggleSidebar={() => reduxDispatch(toggleSidebarState())}
            >
                <SidebarItem icon='https://i.imgur.com/wZ8e1Lc.png' label='Inventory' link='inventory' sidebarOpened={sidebarOpened} />
                <SidebarItem icon='https://i.imgur.com/nWxboHU.png' label='Employees' link='employees' sidebarOpened={sidebarOpened} />
                <SidebarItem icon='https://i.imgur.com/no6wh9w.png' label='Management' link='management' sidebarOpened={sidebarOpened} />
            </Sidebar>
            <div className='pl-8 pt-16'>
                <h1 className='text-7xl font-bold self-center pointer-events-none mb-12'>Inventory</h1>
                {/*Categories Div*/}
                <div className='w-screen'>
                    <h3 className='text-4xl text-neutral-700 font-bold self-center pointer-events-none mb-4'>Categories</h3>
                    <div className='w-3/4 h-screen'>
                        <div className='w-full mb-6 border-[1px] border-green-400 border-opacity-20 h-32 rounded-xl shadow-md flex gap-4 items-center px-4'>
                            <Button onClick={() => {
                                if (!dispatchModal)
                                    return;
                                dispatchModal(
                                    GenerateGenericModalAddAction(
                                        v4(),
                                        'Testing 123',
                                        '⚠️ Test Title',
                                        <div>
                                            <form>
                                                <TextBox placeholder='Category name...' value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                                            </form>
                                        </div>
                                    )
                                )
                            }} type={ButtonType.SECONDARY} label='Add a category' />
                            <Button onClick={() => {}} type={ButtonType.DANGER_SECONDARY} label='Remove a category' />
                        </div>
                        <div className='w-full border-[1px] border-green-400 border-opacity-20 rounded-xl shadow-md'>
                            {
                                props.categories.length !== 0 ?
                                    <div className='grid grid-cols-4'>

                                    </div>
                                    :
                                    <div>
                                        <p className='text-center text-4xl text-neutral-300 m-12'>There&apos;s nothing here yet...</p>
                                    </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </main>
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