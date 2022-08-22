import type {GetServerSideProps, GetServerSidePropsContext, NextPage} from 'next'
import {useContext, useState} from "react";
import {UserData} from '../types/UserData';
import Sidebar from '../components/sidebar/Sidebar';
import SidebarItem from '../components/sidebar/SidebarItem';
import Image from 'next/image';
import Layout from "../components/Layout";
import CheckBox from "../components/Checkbox";
import Button from "../components/Button";
import {ButtonType} from "../types/ButtonType";
import {NotificationContext} from "../components/notifications/NotificationProvider";
import {UserPermissions} from "../types/UserPermissions";
import {useDispatch, useSelector} from "react-redux";
import {toggleSidebarState} from "../utils/redux/SidebarSlice";

type Props = {
    userData : UserData
}

// @ts-ignore
const Home: NextPage = (props: Props) => {
    const [ formState, setFormState ] = useState({
        username: '',
        password: ''
    });

    const [ passwordShown, setPasswordShown ] = useState(false);
    // @ts-ignore
    const sidebarOpened = useSelector(state => state.sidebar.value)
    const reduxDispatch = useDispatch();

    const notificationDispatch = useContext(NotificationContext);
  return (
    <main className={`${props.userData ? '' : 'bg-blurred' } h-screen`}>

        {
        props.userData ? 
            <div className='flex'>
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
                    <div className='flex gap-4 mb-16'>
                        <div className='relative rounded-full w-32 h-32 self-center border-4 border-green-500'>
                            <Image src={props.userData.avatar || 'https://i.imgur.com/V2EC9kV.jpg'} alt='' layout='fill' className='rounded-full' />
                        </div>
                        <h1 className='text-7xl font-bold self-center pointer-events-none'>Welcome back, <span className='text-green-400'>{props.userData.first_name}</span></h1>
                    </div>
                    <div>
                        <h2 className='text-4xl font-bold text-neutral-700'>Overview</h2>
                    </div>
                </div>
            </div> 
            : 
            <div>
                <Layout />
                <div className='mx-auto mt-36 border-green-500 border-solid border-[1px] w-[30rem] p-12 rounded-2xl'>
                    <form onSubmit={e => {
                        e.preventDefault();
                        console.log(`Form submitted. ${formState.username}, ${formState.password}`)
                    }} className='flex flex-col gap-4'>
                        <div className='flex justify-between'>
                            <label className='text-white text-xl'>Username</label>
                            <input type='text' value={formState.username} onChange={(e) => {
                                setFormState(oldState => { return {
                                    username: e.target.value,
                                    password: oldState.password
                                }})
                            }} />
                        </div>
                        <div>
                            <div className='flex justify-between gap-8'>
                                <label className='text-white text-xl'>Password</label>
                                <input type={passwordShown ? 'text' : 'password'} value={formState.password} onChange={(e) => {
                                    setFormState(oldState => { return {
                                        password: e.target.value,
                                        username: oldState.username
                                    }})
                                }} />
                            </div><br/>
                            <CheckBox state={passwordShown} label='Show password' onClick={() => {
                                setPasswordShown(x => !x);  
                            }} />
                        </div>
                        <div className='mx-auto'>
                            <Button onClick={() => {}} type={ButtonType.PRIMARY} label='LOGIN' />
                        </div>
                    </form>
                </div>
            </div>
        }
        
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
            }
        }
    }
}

export default Home;
