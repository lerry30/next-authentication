import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const POST = () => {
    const cookie = cookies();
    cookie.delete('user-json-token-key');
    cookie.delete('user-json-token-data');

    return NextResponse.json({ message: 'Logged out', success: true });
}