import { NextResponse } from 'next/server';
import { sendJSON } from '../utils/send';

const legacyPrefixes = { '/signup': true, '/signin': true};

export const middleware = async (request) => {
    const { origin, pathname } = request.nextUrl;
    
    if(!legacyPrefixes[pathname]) { // to avoid loop since it will always redirect to signin
        // console.log(request.cookies.getAll())
        const encodedKey = request.cookies.get('user-json-token-key')?.value || '';
        const encodedData = request.cookies.get('user-json-token-data')?.value || '';
        const signInStatus = await sendJSON(`${ origin }/api/users/signed`, { encodedKey, encodedData });
        if(signInStatus.signedIn) {
            return NextResponse.next();
        }

        return NextResponse.redirect(new URL('/signin', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - api (API routes)
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       */
      '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}