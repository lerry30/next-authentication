import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '@/app/models/Users';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { emptySignInFields } from '../../../../../utils/emptyValidation';
import { isAnEmail } from '../../../../../utils/emailValidation';
import { config, rateLimit } from '../../../../../utils/rateLimit';

// rate limiter configuration
config(1, { activeMaxRequest: 6 }); // 6 requests allowed per hour

export const GET = () => {
    const cookie = cookies();
    if(!cookie.has('user-signin-token')) {
        /*
            generate token for rate limit
        */
        const hex = crypto.randomBytes(16).toString('hex');
        const token = jwt.sign({ userSignInKey: hex }, process.env.SIGNIN_USER_TOKEN_KEY);
        cookie.set('user-signin-token', token, { secure: true, maxAge: (1000 * 60 * 60 * 24 * 7) });
    }

    return NextResponse.json({ message: '' }, { status: 201 });
}

export const POST = async (request) => {
    try {
        const signInJsonData = await request.json();
        const { email, password } = signInJsonData;

        // restriction for empty credentials
        const invalidFields = emptySignInFields(email, password);
        if(Object.values(invalidFields).length > 0)
            return Response.json({ message: 'All fields should be filled', errorData: invalidFields }, { status: 400 }); // I turn 204 to 400 since nextjs have problem with responding with status code of 204 right now

        if(!isAnEmail(email)) 
            return NextResponse.json({ message: 'Invalid email address or password', errorData: 'unauth' }, { status: 400 });

        const cookie = cookies();
        /*
            rate limit section
        */
        const userSignInToken = cookie.get('user-signin-token')?.value;
        if(!userSignInToken) 
            return NextResponse.json({ message: 'There\'s something wrong. Please try again later.', errorData: 'unauth' }, { status: 400 });
        /*
            get token for rate limit
        */
        const userIdKey = jwt.verify(userSignInToken, process.env.SIGNIN_USER_TOKEN_KEY);
        /*
            rate limit so I need to refuse too much request from a single user(brute force attack)
        */
        const rateLimitMessage = rateLimit(userIdKey.userSignInKey);

        if(rateLimitMessage.message)
            return NextResponse.json({ message: rateLimitMessage.message, errorData: 'unauth' }, { status: 400 });

        const user = await User.findOne({ email });
        if(!user) return NextResponse.json({ message: 'Invalid email address or password', errorData: 'unauth' }, { status: 400 });

        const hashPassword = user?.password || '';
        const isVerified = await bcrypt.compare(password, hashPassword);

        if(!isVerified) return NextResponse.json({ message: 'Invalid email address or password', errorData: 'unauth' }, { status: 400 });

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
    
        return Response.json({ message: '', success: true }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: 'There\'s something wrong with your data.', errorData: 'unauth' }, { status: 400 });
    }
}

export const DELETE = () => {
    const cookie = cookies();
    cookie.delete('user-signin-token');
    return NextResponse.json({ message: 'Sign up completed' }, { status: 200 });
}