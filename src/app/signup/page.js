"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import ErrorField from '@/app/components/ErrorField';
import Loading from '../components/Loading';
import { sendJSON, getData } from '../../../utils/send';
import { emptySignUpFields } from '../../../utils/emptyValidation';

/**
 * a bit of validation in client, then in server
 * check if the user is existing in database
 * send a confirmation code
 */
 
const SignUpPage = () => {
    const [ name, setName ] = useState({ firstname: null, lastname: null });
    const [ emailAddress, setEmailAddress ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ invalidFieldsValue, setInvalidFieldsValue ] = useState({});
    const [ pendingVerification, setPendingVerification ] = useState(false);
    const [ code, setCode ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const router = useRouter();

    const handleError = (error) => {
        const errorData = error?.cause?.payload?.errorData;
        if(!errorData) return;

        if(typeof errorData === 'object') {
            for(const [ key, value ] of Object.entries(errorData)) {
                setInvalidFieldsValue(prev => ({ ...prev, [key]: value }));
            }

            return;
        }

        setInvalidFieldsValue(prev => ({ ...prev, [errorData]: error.message }));
    }

    const abortVerification = async () => {
        setLoading(true);

        setName({ firstname: null, lastname: null });
        setEmailAddress('');
        setPassword('');

        await fetch(`${ process.env.NEXT_PUBLIC_DOMAIN_NAME }/api/users`, { method: 'DELETE' });
        setPendingVerification(false);
        setInvalidFieldsValue({});

        setLoading(false);
    }

    const createUserDataKey = async () => {
        await getData(`${ process.env.NEXT_PUBLIC_DOMAIN_NAME }/api/users/auth`);
    }

    // start the sign up process.
    const handleSubmit = async (ev) => {
        ev.preventDefault();

        setInvalidFieldsValue({});
        setLoading(true);

        const invalidFields = emptySignUpFields(name.firstname, name.lastname, emailAddress, password);
        for(const [ field, message ] of Object.entries(invalidFields)) {
            setInvalidFieldsValue(prev => ({ ...prev, [field]: message }));
        }

        if(Object.values(invalidFields).length > 0) return;
    
        try {
            await createUserDataKey();

            await sendJSON(
                `${ process.env.NEXT_PUBLIC_DOMAIN_NAME }/api/users/auth`,
                { 
                    firstname: name.firstname,
                    lastname: name.lastname,
                    email: emailAddress,
                    password,
                }
            );

            setPendingVerification(true);
        } catch (error) {
            console.log(error); // development
            handleError(error);
        }

        setLoading(false);
    };
    
    // This verifies the user using email code that is delivered.
    const onPressVerify = async (ev) => {
        ev.preventDefault();
        setLoading(true);
    
        try {
            await createUserDataKey();

            if(!code) {
                setInvalidFieldsValue(prev => ({ ...prev, unauth: 'Verification code is required. Check your email to get the verification code' }));
                setLoading(false);
                return;
            }

            const responseFromVerificationCode = await sendJSON(`${ process.env.NEXT_PUBLIC_DOMAIN_NAME }/api/users`, { code });
            setCode(''); // to reset

            console.log(responseFromVerificationCode);
            if(responseFromVerificationCode?.success) {
                fetch(`${ process.env.NEXT_PUBLIC_DOMAIN_NAME }/api/users`, { method: 'DELETE' });
                router.push("/");
            } else {
                setInvalidFieldsValue(prev => ({ ...prev, unauth: 'There\'s something wrong. Please try again later.' }));
            }
        } catch (error) {
            // abort verification
            handleError(error);
            
            if(!error?.cause?.payload?.abort)
                setTimeout(abortVerification, 2000);
        }

        setLoading(false);
    };

    // for firstname and lastname
    const naming = (ev) => {
        const inputElem = ev.target;
        setName({
            ...name,
            [inputElem.name]: inputElem.value
        });
    }

    const start = async () => {
        // is signed in
        const signInStatus = await getData(`${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/users/signed`);
        if(signInStatus.signedIn) {
            router.push('/');
        } else {
            // if not
            const isUserDataAreSaved = document.cookie.includes('user-signup-data-token');
            setPendingVerification(isUserDataAreSaved);
            createUserDataKey();
        }
    }

    useEffect(() => {
        start();
    }, []);
    
    return (
        // { state.postRequest.pathname && <Loading customStyle="w-full min-h-screen" /> }
        <div className="card w-96 bg-zinc-50 shadow-lg shadow-indigo-500/40 dark:bg-neutral-800 dark:border dark:border-neutral-500 dark:shadow-black dark:text-white">
            { loading && <Loading customStyle="w-full min-h-screen" /> }
            { !pendingVerification && (
                <form>
                    <h3 className="text-center font-extrabold text-3xl">Sign Up</h3>
                    <div className="flex gap-2">
                        <div className="w-1/2">
                            <label htmlFor="firstname">First Name</label>
                            <input 
                                onChange={naming} 
                                className="input w-full dark:bg-neutral-600"
                                id="firstname" 
                                name="firstname" 
                                type="text" 
                            />
                            <ErrorField message={ invalidFieldsValue['firstname'] }/>
                        </div>
                        <div className="w-1/2">
                            <label htmlFor="lastname">Last Name</label>
                            <input 
                                onChange={naming} 
                                className="input w-full dark:bg-neutral-600"
                                id="lastname" 
                                name="lastname" 
                                type="text" 
                            />
                            <ErrorField message={ invalidFieldsValue['lastname'] }/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email">Email</label>
                        <input 
                            onChange={(e) => setEmailAddress(e.target.value)} 
                            className="input w-full dark:bg-neutral-600"
                            id="email" 
                            name="email" 
                            type="email" 
                        />
                        <ErrorField message={ invalidFieldsValue['email'] }/>
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
                        <ErrorField message={ invalidFieldsValue['password'] }/>
                    </div>
                    <button 
                        type="submit"
                        onClick={handleSubmit}
                        className="button w-full mt-2 text-sm"
                    >
                        CONTINUE
                    </button>

                    <ErrorField message={ invalidFieldsValue?.unauth }/>
                    
                    <small className="text-center">
                        <span>Don't have an account yet?</span>
                        <Link 
                            href="/signin"
                            className="ml-2 bg-emerald-700/30 px-2 rounded-full"
                        >
                            Sign in
                        </Link>
                    </small>
                </form>
            )}

            { pendingVerification && (
                <div className="w-full">
                    <button 
                        onClick={ abortVerification }
                        className="absolute top-8 left-8"
                    >
                            &lt;-{ ' ' }cancel
                    </button>
                    <form>
                        <input
                            value={code}
                            placeholder="Code..."
                            onChange={(e) => setCode(e.target.value)}
                            className="input w-full dark:bg-neutral-600"
                        />

                        <ErrorField message={ invalidFieldsValue?.unauth }/>

                        <button 
                            onClick={onPressVerify}
                            className="button w-full mt-2 text-sm"
                    >
                        Verify Email
                    </button>
                </form>
                </div>
            )}
        </div>
    );
}

export default SignUpPage;