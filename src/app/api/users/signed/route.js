import { NextResponse } from 'next/server';
import { decodeUserIdFromHeader, decodeUserIdFromRequest } from '../../../../../utils/decode';

export const GET = () => {
    const signedIn = !!decodeUserIdFromHeader();
    return NextResponse.json({ message: '', signedIn }, { status: 200 });
}

export const POST = async (request) => {
    const { encodedKey, encodedData } = await request.json();
    const signedIn = !!decodeUserIdFromRequest(encodedKey, encodedData);
    return NextResponse.json({ message: '', signedIn }, { status: 200 });
}