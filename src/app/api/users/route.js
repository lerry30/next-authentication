import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { terminateAllHtmlTags } from '../../../../utils/fieldValidation';
import { config, rateLimit } from '../../../../utils/rateLimit';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '@/app/models/Users';
import crypto from 'crypto';

// rate limiter configuration
config(2, { activeMaxRequest: 3 }); // 3 requests allowed per hour

// SIGN UP
export const POST = async (request) => {
    try {
        const { code } = await request.json();
        if(!code) return NextResponse.json({ message: 'Verification code is required. Check your email to get the verification code', errorData: 'unauth', abort: false }, { status: 401 });

        const cleanCode = terminateAllHtmlTags(code);

        const cookie = cookies();
        
        /*
            rate limit section
        */
        const userSignUpKeyToken = cookie.get('user-signup-token')?.value;
        if(!userSignUpKeyToken) 
            return NextResponse.json({ message: 'There\'s something wrong. Please try again later.', errorData: 'unauth', abort: true }, { status: 400 });
        /*
            get token for rate limit and vercel blob
        */
        const userIdKey = jwt.verify(userSignUpKeyToken, process.env.SIGNUP_USER_TOKEN_KEY);
        /*
            rate limit
            so I need to refuse too much request from a single user(brute force attack)
        */
        const rateLimitMessage = rateLimit(userIdKey.userSignUpKey);

        if(rateLimitMessage.message)
            return NextResponse.json({ message: rateLimitMessage.message, errorData: 'unauth', abort: false }, { status: 400 });

        /*
            verification section
        */
        const userSignUpDataToken = cookie.get('user-signup-data-token')?.value;
        if(!userSignUpDataToken) 
            return NextResponse.json({ message: 'There\'s something wrong. Please try again later.', errorData: 'unauth', abort: true }, { status: 401 });

        const userDataToken = jwt.verify(userSignUpDataToken, process.env.SIGNUP_USER_TOKEN_KEY);

        if(!userDataToken?.userData)
            return NextResponse.json({ message: 'There\'s something wrong. Please try again later.', errorData: 'unauth', abort: true }, { status: 401 });

        const { firstname, lastname, email, hashPassword, hashVerificationCode } = userDataToken?.userData;

        if(!firstname || !lastname || !email || !hashPassword || !hashVerificationCode)
            return NextResponse.json({ message: 'There\'s something wrong. Please try again later.', errorData: 'unauth', abort: true }, { status: 401 });

        const codeVerificationStatus = await bcrypt.compare(cleanCode, hashVerificationCode);

        if(!codeVerificationStatus) 
            return NextResponse.json({ message: 'Verification code is invalid. Check your email to get the right verification code', errorData: 'unauth', abort: false }, { status: 401 });

        // save into database
        const user = await User.create({ firstname, lastname, email, password: hashPassword });

        /*
            token for signin that will save in cookies,
            so user doen't need to put his/her credential
        */
        const userTokenKey = crypto.randomBytes(16).toString('hex');
        const signInCredentialKey = `${ process.env.SIGNIN_USER_TOKEN_KEY }-${ userTokenKey }`;
        const encodedKey = jwt.sign({ userTokenKey }, process.env.SIGNIN_USER_TOKEN_KEY);
        const encodedData = jwt.sign({ userId: user._id }, signInCredentialKey);
        cookie.set('user-json-token-key', encodedKey);
        cookie.set('user-json-token-data', encodedData);

        return NextResponse.json({ message: '', success: true }, { status: 201 });
    } catch(error) {
        console.log(error);
        return NextResponse.json({ message: 'There\'s something wrong. Please try again.', errorData: 'unauth', abort: true }, { status: 401 });
    }
}

export const DELETE = () => {
    const cookie = cookies();
    cookie.delete('user-signup-token');
    cookie.delete('user-signup-data-token');

    return NextResponse.json({ message: 'Sign up completed' }, { status: 200 });
}