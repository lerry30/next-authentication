import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
// import { toHash } from '../../../../utils/crypt';
// import crypto from 'crypto';

// SIGN UP
export const POST = async (request) => {
    try {
        const { firstname, lastname, email, password } = await request.json();
        console.log(firstname, lastname, email, password);

        // save into database
        // const prisma = await new PrismaClient();

        // const hashPassword = (await toHash(password)).toString();
        // await prisma.user.create({ data: { firstname, lastname, email, password: hashPassword } });

        return NextResponse.json({ successful: true }, { status: 201 });
    } catch(error) {
        console.log(error);
        return NextResponse.json({ successful: false }, { status: 401 });
    }
}

// GET USER ID
export const GET = async (request) => {
    try {
        

        return NextResponse.json({ successful: true, user: userData }, { status: 201 });
    } catch(error) {
        console.log(error);
        return NextResponse.json({ successful: false }, { status: 401 });
    }
}