import { NextResponse } from 'next/server';
import { isValidFileType } from '../../../../utils/file';
import crypto from 'crypto';

export const putFileInBucket = async (file) => {
    if(file?.size > 0) {
        if(!isValidFileType(file?.type)) {
            const errorResponse = NextResponse.json({ message: 'Invalid file' }, { status: 400 });
            return { errorResponse, fullFilename: '' }
        }

        const fileExtension = file.type.split('/')[1]; // image/png - png
        const filename = crypto.randomBytes(16).toString("hex");
        const fullFilename = `${ filename }.${ fileExtension }`;

        const awsResponse = await fetch(`${process.env.AWS}/${fullFilename}`,
            {
                method: 'PUT',
                body: file,
            }
        );

        if(awsResponse.status !== 200) {
            const errorResponse = NextResponse.json({ message: 'An error occurred while uploading the file. Please try again later.' }, { status: 500 });
            return { errorResponse, fullFilename: '' }
        }

        return { errorResponse: null, fullFilename };
    }
}