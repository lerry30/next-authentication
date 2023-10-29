import { NextResponse } from 'next/server';
import { terminateAllHtmlTags } from '../../../../utils/fieldvalidation';
import { PrismaClient } from '@prisma/client';
import { putFileInBucket } from './aws';
import { rateLimit } from './ratelimit';
import jwt from 'jsonwebtoken';
import readStream from '../../../../utils/readstream';

export const POST = async (request) => {
    try {
        await new Promise((resolve, reject) => {
            setTimeout(resolve, 10_000);
        });

        console.count('done');

        return NextResponse.json({ message: 'Your post has been successfully uploaded.' }, { status: 200 });

        // const form = await request.formData();
        // const postTitle = form.get('title');
        // const postFoodName = form.get('foodname');
        // const postDescription = form.get('description');
        // const file = form.get('file');
        // const userData = JSON.parse(form.get('user'))?.user || {};

        // const c_postTitle = terminateAllHtmlTags(postTitle);
        // const c_postFoodName = terminateAllHtmlTags(postFoodName);
        // const c_postDescription = terminateAllHtmlTags(postDescription);

        // const jwtSecret = process.env.JWT_SECRET + userData?._k;
        // const decoded = jwt.verify(userData?.id, jwtSecret);
        // const rateLimitMessage = await rateLimit(decoded.userId);

        // if(rateLimitMessage.message)
        //     return NextResponse.json({ message: rateLimitMessage.message }, { status: 400 });

        // if(!c_postFoodName) 
        //     return NextResponse.json({ message: 'Food name is required' }, { status: 400 });
                                            
        // const { errorResponse, fullFilename } = await putFileInBucket(file);
        // if(errorResponse) return errorResponse;

        // const prisma = new PrismaClient();
        // await prisma.post.create({ data: {
        //                                 title: c_postTitle,
        //                                 foodname: c_postFoodName,
        //                                 description: c_postDescription,
        //                                 filename: fullFilename,
        //                                 authorId: decoded.userId
        //                             } 
        //                     });

        // return NextResponse.json({ message: 'Your post has been successfully uploaded.' }, { status: 200 });
    } catch(error) {
        /**
         * I added try catch block to ensure that even prisma or sending to aws will throw proper message
         * for clients
         */
        console.log(error);
        return NextResponse.json({ message: 'An error occurred. Please try again later.' }, { status: 500 });
    } 
}

export const GET = async (request) => {
    try {
        const prisma = new PrismaClient();
        const postsWithAuthor = await prisma.post.findMany({ include: { author: true } });

        const fetchesForFiles = [];
        for(const post of postsWithAuthor) {
            const { filename } = post;
            const fetchImages = fetch(`${process.env.AWS}/${filename}`);
            fetchesForFiles.push(fetchImages);
        }

        const images = await Promise.all(fetchesForFiles);

        for(let i = 0; i < images.length; i++) {
            const image = images[i];
            const imageDataUrl = await readStream(image.body);
            postsWithAuthor[i]['image'] = imageDataUrl;
        }

        // console.log(postsWithAuthor);

        return NextResponse.json({ postsWithAuthor }, { status: 200 });
    } catch(error) {
        console.log(error);
        return NextResponse.json({ message: 'An error occurred. Please try again later.' }, { status: 500 });
    }
}
























// import { NextResponse } from 'next/server';
// import { terminateAllHtmlTags } from '../../../../utils/fieldvalidation';
// import { isValidFileType } from '../../../../utils/file';
// import { PrismaClient } from '@prisma/client';
// import jwt from 'jsonwebtoken';
// import crypto from 'crypto';

// export const POST = async (request) => {
//     try {
//         const form = await request.formData();
//         const postTitle = form.get('title');
//         const postFoodName = form.get('foodname');
//         const postDescription = form.get('description');
//         const file = form.get('file');
//         const userData = JSON.parse(form.get('user'))?.user || {};

//         const c_postTitle = terminateAllHtmlTags(postTitle);
//         const c_postFoodName = terminateAllHtmlTags(postFoodName);
//         const c_postDescription = terminateAllHtmlTags(postDescription);

//         let fullFilename = '';

//         if(!c_postFoodName) 
//             return NextResponse.json({ message: 'Food name is required' }, { status: 400 });
                                            
//         if(file?.size > 0) {
//             if(!isValidFileType(file?.type))
//                 return NextResponse.json({ message: 'Invalid file' }, { status: 400 });

//             const fileExtension = file.type.split('/')[1]; // image/png - png
//             const filename = crypto.randomBytes(16).toString("hex");
//             fullFilename = `${ filename }.${ fileExtension }`;

//             const awsResponse = await fetch(`${process.env.AWS}/${fullFilename}`,
//                 {
//                     method: 'PUT',
//                     body: file,
//                 }
//             );

//             if(awsResponse.status !== 200) {
//                 return NextResponse.json({ message: 'An error occurred while uploading the file. Please try again later.' }, { status: 500 });
//             }
//         }


//         const prisma = new PrismaClient();
//         const jwtSecret = process.env.JWT_SECRET + userData?._k;
//         const decoded = jwt.verify(userData?.id, jwtSecret);

//         await prisma.post.create({ data: {
//                                         title: c_postTitle,
//                                         foodname: c_postFoodName,
//                                         description: c_postDescription,
//                                         filename: fullFilename,
//                                         authorId: decoded.userId
//                                     } 
//                             });

//         return NextResponse.json({ message: 'Your post has been successfully uploaded.' }, { status: 200 });
//     } catch(error) {
//         /**
//          * I added try catch block to ensure that even prisma or sending to aws will throw proper message
//          * for clients
//          */
//         console.log(error);
//         return NextResponse.json({ message: 'An error occurred. Please try again later.' }, { status: 500 });
//     } 
// }