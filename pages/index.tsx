import type {GetServerSideProps, GetServerSidePropsContext, NextPage} from 'next'
import {useContext, useEffect, useState} from "react";
import {UserData} from '../types/UserData';
import Sidebar from '../components/sidebar/Sidebar';
import SidebarItem from '../components/sidebar/SidebarItem';
import Image from 'next/image';
import Layout from "../components/Layout";
import CheckBox from "../components/Checkbox";
import Button from "../components/Button";
import {ButtonType} from "../types/ButtonType";
import {NotificationContext} from "../components/notifications/NotificationProvider";
import {useDispatch, useSelector} from "react-redux";
import {toggleSidebarState} from "../utils/redux/SidebarSlice";
import {verify} from "jsonwebtoken";
import {Field, Form} from 'react-final-form';
import {GenerateNotificationAddAction} from "../components/notifications/NotificationTypes";
import {v4} from "uuid";
import {NotificationType} from "../types/NotificationType";
import {useMutation} from "react-query";
import axios from "axios";
import {setUserData} from "../utils/redux/UserDataSlice";
import Spinner from "../components/Spinner";
import {generateDefaultSidebar} from "../utils/GeneralUtils";

type Props = {
    userData: UserData
}

// @ts-ignore
const Home: NextPage = (props: Props) => {
    const [ passwordShown, setPasswordShown ] = useState(false);
    // @ts-ignore
    const userData = useSelector(state => state.userData.value);
    // @ts-ignore
    const sidebarOpened = useSelector(state => state.sidebar.value)
    const reduxDispatch = useDispatch();

    useEffect(() => {
        reduxDispatch(setUserData(props.userData));
    }, [])

    const notificationDispatch = useContext(NotificationContext);

    const login = useMutation((loginObject: { username: string, password: string }) => {
        return axios.post('/api/login', loginObject)
            .then((data) => {
                reduxDispatch(setUserData(data.data.data));

                if (notificationDispatch) {
                    notificationDispatch(GenerateNotificationAddAction(
                        v4(),
                        NotificationType.SUCCESS,
                        'Successfully logged in!'
                    ))
                }
            })
            .catch(err => {
                console.error(err);
                if (notificationDispatch) {
                    notificationDispatch(GenerateNotificationAddAction(
                        v4(),
                        NotificationType.ERROR,
                        err.response.data.message || JSON.stringify(err.response.data.error)
                    ))
                }
            });
    });

  return (
      <Layout>
          <main className={`${Object.keys(userData).length ? '' : 'bg-blurred' } h-screen`}>

              {
                  Object.keys(userData).length ?
                      <div className='flex dark:bg-neutral-800 transition-fast'>
                          {generateDefaultSidebar(sidebarOpened, reduxDispatch)}
                          <div className='pl-8 pt-16'>
                              <div className='flex gap-4 mb-16'>
                                  <div className='relative rounded-full w-32 h-32 self-center border-4 border-green-500'>
                                      <Image src={userData.avatar || 'https://i.imgur.com/V2EC9kV.jpg'} alt='' layout='fill' className='rounded-full' />
                                  </div>
                                  <h1 className='text-7xl font-bold self-center pointer-events-none dark:text-white'>Welcome back, <span className='text-green-400 dark:text-green-500'>{userData.first_name}</span></h1>
                              </div>
                              <div>
                                  <h2 className='text-4xl font-bold text-neutral-700 dark:text-green-400'>Overview</h2>
                              </div>
                          </div>
                      </div>
                      :
                      <div>
                          <div className='relative w-80 h-80 mx-auto'>
                              <Image src='https://i.imgur.com/HLTQ78m.png' alt='' layout='fill' />
                          </div>
                          <div className='mx-auto border-green-500 border-solid border-[1px] w-[30rem] p-12 rounded-2xl'>
                              <Form
                                  onSubmit={values => {
                                      if (!values.username) {
                                          if (notificationDispatch)
                                              notificationDispatch(GenerateNotificationAddAction(
                                                  v4(),
                                                  NotificationType.ERROR,
                                                  "Username is a required field!"
                                              ));
                                          return;
                                      }

                                      if (!values.password) {
                                          if (notificationDispatch)
                                              notificationDispatch(GenerateNotificationAddAction(
                                                  v4(),
                                                  NotificationType.ERROR,
                                                  "Password is a required field!"
                                              ));
                                          return;
                                      }

                                      login.mutate({ username: values.username, password: values.password });
                                  }}
                                  render={({ handleSubmit, form, submitting, pristine, values}) => (
                                      <form onSubmit={handleSubmit}>
                                          <div className='flex flex-col gap-4'>
                                              <div className='flex justify-between'>
                                                  <label className='text-white text-xl self-center'>Username</label>
                                                  <Field
                                                      name='username'
                                                      component='input'
                                                      type='text'
                                                  />
                                              </div>
                                              <div className='flex justify-between'>
                                                  <label className='text-white text-xl self-center'>Password</label>
                                                  <Field
                                                      name='password'
                                                      component='input'
                                                      type={`${passwordShown ? 'text' : 'password'}`}
                                                  />
                                              </div><br />
                                              <CheckBox state={passwordShown} label='Show password' onClick={() => {
                                                  setPasswordShown(x => !x);
                                              }} />
                                              <div className='mx-auto'>
                                                  <Button
                                                      type={ButtonType.PRIMARY}
                                                      submitButton={true}
                                                      isDisabled={submitting || pristine}
                                                      isWorking={login.isLoading}
                                                  />
                                              </div>
                                          </div>
                                      </form>
                                  )}
                              />
                          </div>
                      </div>
              }
          </main>
      </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    const {authorization} = context.req.cookies;

    try {
        // @ts-ignore
        const decoded = verify(authorization, process.env.LOCAL_API_KEY);
        return {
            props: {
                userData: {
                    username: decoded.username,
                    first_name: decoded.first_name,
                    last_name: decoded.last_name,
                    creation_date: decoded.creation_date,
                    permissions: decoded.permissions,
                    email: decoded.email || null,
                    avatar: decoded.avatar || null
                }
            }
        }
    } catch (err) {
        return {
            props: {
                userData: {}
            }
        }
    }
}

export default Home;
