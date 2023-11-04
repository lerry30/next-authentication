"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendJSON, getData } from '../../../utils/send';

import Link from 'next/link';
import ErrorField from '@/app/components/ErrorField';
 
const SignInPage = () => {
    const [ emailAddress, setEmailAddress ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ invalidFieldsValue, setInvalidFieldsValue ] = useState({});

    const router = useRouter();

    const createUserDataKey = async () => {
        await getData(`${ process.env.NEXT_PUBLIC_DOMAIN_NAME }/api/users/signin`);
    }

    // start the sign In process.
    const handleSubmit = async (e) => {
        e.preventDefault();

        setInvalidFieldsValue({});
    
        try {
            await createUserDataKey();

            const signInResponse = await sendJSON(`${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/users/signin`, { email: emailAddress, password });
            if(signInResponse?.success) {
                fetch(`${ process.env.NEXT_PUBLIC_DOMAIN_NAME }/api/users/signin`, { method: 'DELETE' });
                router.push("/");
            } else {
                setInvalidFieldsValue(prev => ({ ...prev, unauth: 'There\'s something wrong. Please try again later.' }));
            }
        } catch (error) {
            // console.error('error', error.errors[0].longMessage)
            // const { message } = error.errors[0];
            setInvalidFieldsValue({ unauth: error.message });
        }
    };

    const start = async () => {
        // is signed in
        const signInStatus = await getData(`${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/users/signed`);
        if(signInStatus.signedIn) {
            router.push('/');
        } else {
            // if not
            createUserDataKey();
        }
    }

    useEffect(() => {
        start();
    }, []);
    
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