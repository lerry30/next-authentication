import { NextResponse } from 'next/server.js';
// import { sendEmail } from '../../../../../utils/email';
import { rateLimit } from '../../../../../utils/rateLimit';
import { isDisposableEmail, isAnEmail } from '../../../../../utils/emailValidation';
import { isAValidPassword, missingRequirements } from '../../../../../utils/passwordValidation';
import { emptySignUpFields } from '../../../../../utils/emptyValidation';
import { toHash } from '../../../../../utils/crypt';
import { cookies } from 'next/headers';

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '@/app/models/Users';

/**
 * generate token for rate limit and vercel blob, this will be stored in local storage
 * validate inputs
 *      check if empty
 *      check if the email is a temp mail
 *              I can't find any solution to actually detect if the mail is
 *                  a disposable so I made a simple list of invalid domain name
 *                  to prevent at least one of them from registering into my web
 *      check the email and password format
 * check if the user exist in the database
 */

export const GET = (request) => {
    const cookie = cookies();
    if(!cookie.has('user-signup-token')) {
        /*
            generate token for rate limit
        */
        const hex = crypto.randomBytes(16).toString('hex');
        const token = jwt.sign({ userSignUpKey: hex }, process.env.SIGNUP_USER_TOKEN_KEY);
        cookie.set('user-signup-token', token, { secure: true, maxAge: (1000 * 60 * 60 * 3) });
    }

    return NextResponse.json({ message: '', }, { status: 201 });
}

export const POST = async (request) => {
    try {
        const signUpJsonData = await request.json();
        const { firstname, lastname, email, password } = signUpJsonData;

        const invalidFields = emptySignUpFields(firstname, lastname, email, password);
        if(Object.values(invalidFields).length > 0)
            return Response.json({ message: 'All fields should be filled', errorData: invalidFields }, { status: 400 }); // I turn 204 to 400 since nextjs have problem with responding with status code of 204 right now

        if(!isAnEmail(email)) 
            return NextResponse.json({ message: 'Invalid email address', errorData: 'email' }, { status: 501 });

        if(isDisposableEmail(email)) 
            return NextResponse.json({ message: 'Email is invalid. Try different one', errorData: 'email' }, { status: 501 });

        if(!isAValidPassword(password)) {
            const missing = missingRequirements(password);
            return NextResponse.json({ message: `Invalid password. ${missing}`, errorData: 'password' }, { status: 401 });
        }

        const cookie = cookies();
        /*
            rate limit section
        */
        const userSignUpToken = cookie.get('user-signup-token')?.value;
        if(!userSignUpToken) 
            return NextResponse.json({ message: 'There\'s something wrong. Please try again later.', errorData: 'unauth' }, { status: 400 });
        /*
            get token for rate limit
        */
        const userIdKey = jwt.verify(userSignUpToken, process.env.SIGNUP_USER_TOKEN_KEY);
        /*
            rate limit so I need to refuse too much request from a single user(brute force attack)
        */
        const rateLimitMessage = rateLimit(userIdKey.userSignUpKey);

        if(rateLimitMessage.message)
            return NextResponse.json({ message: rateLimitMessage.message, errorData: 'unauth' }, { status: 400 });

        /*
            check if the user exist in the database
            since I'm not connected to database I'll skip this part
        */
        const userFromDb = await User.findOne({ email });
        if(userFromDb)
            return NextResponse.json({ message: 'User already exist.', errorData: 'unauth' }, { status: 401 });

        /*
            create random 6 digit, for verification code that will be send to user email
        */
        const verificationCode = Math.floor(100000 + Math.random() * 900000);

        /*
            send verification code
        */

        const hashPassword = await toHash(password);
        const hashVerificationCode = await toHash(`${ verificationCode }`);
        const userData = { firstname, lastname, email, hashPassword, hashVerificationCode };

        const token = jwt.sign({ userData }, process.env.SIGNUP_USER_TOKEN_KEY);
        cookie.set('user-signup-data-token', token, { secure: true, maxAge: (1000 * 60 * 60 * 3) });

        console.log(verificationCode);
        return NextResponse.json({ message: 'User data verified.' }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: 'There\'s something wrong with your data.', errorData: 'unauth' }, { status: 400 });
    }
}