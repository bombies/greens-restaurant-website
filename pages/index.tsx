import type { NextPage } from 'next'
import Layout from "../components/Layout";
import {useState} from "react";
import Button from "../components/Button";

const Home: NextPage = () => {
    const [ formState, setFormState ] = useState({
        username: '',
        password: ''
    });

  return (
    <main className='bg-blurred h-screen'>
        <Layout/>
        <div>
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
                    <div className='flex justify-between gap-8'>
                        <label className='text-white text-xl'>Password</label>
                        <input type='password' value={formState.password} onChange={(e) => {
                            setFormState(oldState => { return {
                                password: e.target.value,
                                username: oldState.username
                            }})
                        }} />
                    </div>
                    <div className='mx-auto'>
                        <Button onClick={() => {}} type='primary' label='LOGIN' />
                    </div>
                </form>
            </div>
        </div>
    </main>
  )
}

export default Home;
