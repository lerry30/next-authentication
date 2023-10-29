import { NextResponse } from 'next/server.js';
// import { sendEmail } from '../../../../../utils/email';
import { isDisposableEmail, isAnEmail } from '../../../../../utils/emailValidation';
import { isAValidPassword, missingRequirements } from '../../../../../utils/passwordValidation';
import { emptyFields } from '../../../../../utils/emptyValidation';

/**
 * validate inputs
 *      check if empty
 *      check if the email is a temp mail
 *              I can't find any solution to actually detect if the mail is
 *                  a disposable so I made a simple list of invalid domain name
 *                  to prevent at least one of them from registering into my web
 *      check the email and password format
 * check if the user exist in the database
 */
export const POST = async (request) => {
    try {
        const signUpJsonData = await request.json();
        const { firstname, lastname, email, password } = signUpJsonData;

        const invalidFields = emptyFields(firstname, lastname, email, password);
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

        /*
            check if the user exist in the database
            since I'm not connected to database I'll skip this part
        */


        /*
            send verification code
        */

        return NextResponse.json({ message: 'User data verified.' }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: 'There\'s something wrong in your data.', errorData: 'unauth' }, { status: 400 });
    }
}