import { promises as fs } from 'fs';

const writeRateLimitData = async (userId, data, prevData) => {
    const filePath = process.cwd() + '/src/app/server/ratelimitdata.json';
    const userData = { [userId]: data };
    const newData = JSON.stringify({ ...prevData, ...userData }, null, 4);
    await fs.writeFile(filePath, newData, 'utf8');
}

export const rateLimit = async (userId) => {
    const MAX_REQUEST = 5; // 5 request before it activates the long rest
    const SHORT_REST = 1000 * 60;
    const LONG_REST = 1000 * 60 * 60;

    const filePath = process.cwd() + '/src/app/server/ratelimitdata.json';
    const jsonContent = await fs.readFile(filePath, 'utf8');
    const content = JSON.parse(jsonContent);

    const rateLimitUserData = content[userId];
    const currentDate = Date.now();

    // I did not change the structure of the code for the sake of readability

    // very first request
    if(!rateLimitUserData) {
        const data = { no_of_request: 1, date_of_request: currentDate, time_to_rest: null };
        await writeRateLimitData(userId, data, content);
        return { message: null }; // passed
    }

    // if the number of request is more than 5, time_to_rest definitely has a time to rest
    if(rateLimitUserData.time_to_rest !== null) {
        const timeSpanOfRequestFromAnHour = currentDate - rateLimitUserData.time_to_rest;
        if(timeSpanOfRequestFromAnHour > LONG_REST) {
            const data = { no_of_request: 1, date_of_request: currentDate, time_to_rest: null };
            await writeRateLimitData(userId, data, content);
            return { message: null }; // passed
        }

        return { message: 'I apologize, but we are currently managing our server\'s workload to ensure the best service for all our users. Due to our current capacity, we may not be able to accommodate excessive requests at this time. Please consider trying your request again in about an hour.' };
    }

    // 5 request per hour
    if(rateLimitUserData.no_of_request >= MAX_REQUEST) {
        const data = { no_of_request: 0, date_of_request: null, time_to_rest: currentDate };
        await writeRateLimitData(userId, data, content);

        return { message: 'I apologize, but we are currently managing our server\'s workload to ensure the best service for all our users. Due to our current capacity, we may not be able to accommodate excessive requests at this time. Please consider trying your request again in about an hour.' };
    }

    const timeSpanOfRequest = currentDate - rateLimitUserData.date_of_request;
    if(timeSpanOfRequest > SHORT_REST) {
        const noOfRequest = rateLimitUserData.no_of_request + 1;
        const data = { no_of_request: noOfRequest, date_of_request: currentDate, time_to_rest: null };
        await writeRateLimitData(userId, data, content);
        return { message: null }; // passed
    } else {
        return { message: 'Too many requests. Please try your request again in about a minute.' };
    }
}