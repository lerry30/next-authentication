// const userTokenKey = crypto.randomBytes(16).toString('hex');
// const signInCredentialKey = `${ process.env.SIGNIN_USER_TOKEN_KEY }-${ userTokenKey }`;
// const userJSONTokenKey = jwt.sign({ userTokenKey }, process.env.SIGNIN_USER_TOKEN_KEY);
// const userJSONTokenData = jwt.sign({ userId: user._id }, signInCredentialKey);
// cookie.set('user-json-token-key', userJSONTokenKey);
// cookie.set('user-json-token-data', userJSONTokenData);

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const decodeUserIdFromHeader = () => {
    try {
        const cookie = cookies();
        if(!cookie.has('user-json-token-key') || !cookie.has('user-json-token-data')) return null;

        const encodedKey = cookie.get('user-json-token-key')?.value || '';
        const { userTokenKey } = jwt.verify(encodedKey, process.env.SIGNIN_USER_TOKEN_KEY);

        if(!userTokenKey) return null;

        const signInCredentialKey = `${ process.env.SIGNIN_USER_TOKEN_KEY }-${ userTokenKey }`;

        const encodedData = cookie.get('user-json-token-data')?.value || '';
        const decoded = jwt.verify(encodedData, signInCredentialKey);

        return decoded?.userId;
    } catch(error) {
        console.log(error?.message);
        return null;
    }
}

export const decodeUserIdFromRequest = (encodedKey, encodedData) => {
    try {
        const { userTokenKey } = jwt.verify(encodedKey, process.env.SIGNIN_USER_TOKEN_KEY);
        if(!userTokenKey) return null;

        const signInCredentialKey = `${ process.env.SIGNIN_USER_TOKEN_KEY }-${ userTokenKey }`;
        const decoded = jwt.verify(encodedData, signInCredentialKey);

        return decoded?.userId;
    } catch(error) {
        console.log(error?.message);
        return null;
    }
}