import { SESClient, SendEmailCommand, VerifyEmailIdentityCommand } from '@aws-sdk/client-ses';

// const createVerifyEmailIdentityCommand = (emailAddress) => {
//     return new VerifyEmailIdentityCommand({ EmailAddress: emailAddress });
// };

export const sendEmail = async (emailAddress) => {
    const SES_CONFIG = {
        credentials: {
            accessKeyId: process.env.AWS_SES_SMTP_USERNAME,
            secretAccessKey: process.env.AWS_SES_SMTP_PASSWORD
        },

        region: process.env.AWS_DEFAULT_REGION
    }

    const sesClient = new SESClient(SES_CONFIG);

    const params = {
        Source: 'recipelistcious@gmail.com',
        Destination: {
            ToAddresses: [ emailAddress ]
        },

        ReplyToAdresses: [],
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: '<h1>This is the body of my email!</h1>'
                },

                Text: {
                    Charset: 'UTF-8',
                    Data: 'This is the body of my plain text email'
                }
            },

            Subject: {
                Charset: 'UTF-8',
                Data: 'Hello! is it me you looking for?'
            }
        }
    };

    try {
        // const verifyEmailIdentityCommand = createVerifyEmailIdentityCommand(emailAddress);
        // const verifyingStatus = await sesClient.send(verifyEmailIdentityCommand);

        // console.log(verifyingStatus);

        const sendEmailCommand = new SendEmailCommand(params);
        const res = await sesClient.send(sendEmailCommand);
        console.log('Email has been sent! ', res);
    } catch(error) {
        console.log(error);
    }
}

// ap-southeast-2
// process.env.AWS_SES_SMTP_USERNAME
// process.env.AWS_SES_SMTP_PASSWORD

