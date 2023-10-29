"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import ErrorField from '@/app/components/ErrorField';
 
const SignInPage = () => {
    const [ emailAddress, setEmailAddress ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ invalidFieldsValue, setInvalidFieldsValue ] = useState({});
    const router = useRouter();

    // start the sign In process.
    const handleSubmit = async (e) => {
        e.preventDefault();

        setInvalidFieldsValue({});
    
        try {
        
            if (result.status === 'complete') {

                router.push('/')
            } else {
                /*Investigate why the login hasn't completed */
                // console.log(result);
            }
        } catch (error) {
            // console.error('error', error.errors[0].longMessage)
            // const { message } = error.errors[0];
            setInvalidFieldsValue({ unauth: 'Invalid email or password' });
        }
    };
    
    return (
        <div className="card w-96 bg-zinc-50 shadow-lg shadow-indigo-500/40 dark:bg-neutral-800 dark:border dark:border-neutral-500 dark:shadow-black">
            <form className="flex flex-col gap-2">
                <h3 className="text-center font-extrabold text-3xl">Sign In</h3>
                <div>
                    <label htmlFor="email">Email</label>
                    <input 
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="input w-full dark:bg-neutral-600"
                        id="email" 
                        name="email" 
                        type="email" 
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="input w-full dark:bg-neutral-600"
                        id="password" 
                        name="password" 
                        type="password" 
                    />
                </div>
                <button 
                    onClick={handleSubmit}
                    className="button w-full mt-2 text-sm"
                >
                    CONTINUE
                </button>

                <ErrorField message={ invalidFieldsValue?.unauth } />

                <small className="text-center">
                    <span>No account?</span>
                    <Link 
                        href="/signup"
                        className="ml-2 bg-emerald-700/30 px-2 rounded-full"
                    >
                        Sign up
                    </Link>
                </small>
            </form>
        </div>
    );
}

export default SignInPage;