let MAX_REQUEST = 5; // 5 request before it activates the long rest
let SHORT_REST = 1000 * 60;
let LONG_REST = 1000 * 60 * 60;

const listOfRequestMade = {};

export const config = (gapPerRequest = null, { activeMaxRequest, rest }) => {
    SHORT_REST = gapPerRequest ? gapPerRequest * 1000 : SHORT_REST;
    MAX_REQUEST = activeMaxRequest ? activeMaxRequest : MAX_REQUEST;
    LONG_REST = rest ? rest : LONG_REST;
}

// I did not change the structure of the code for the sake of readability
export const rateLimit = (userId) => {
    cleanUp(); // remove unused user data in a day
    const currentDate = Date.now();
    const rateLimitUserData = listOfRequestMade[userId];

    // very first request
    if(!rateLimitUserData) {
        const data = { no_of_request: 1, date_of_request: currentDate, time_to_rest: null };
        listOfRequestMade[userId] = data;
        return { message: null }; // passed
    }

    // if the number of request is more than 5, time_to_rest definitely has a time to rest
    if(rateLimitUserData.time_to_rest !== null) {
        const timeSpanOfRequestFromAnHour = currentDate - rateLimitUserData.time_to_rest;
        if(timeSpanOfRequestFromAnHour > LONG_REST) {
            const data = { no_of_request: 1, date_of_request: currentDate, time_to_rest: null };
            listOfRequestMade[userId] = data;
            return { message: null }; // passed
        }

        return { message: 'I apologize, but we are currently managing our server\'s workload to ensure the best service for all our users. Due to our current capacity, we may not be able to accommodate excessive requests at this time. Please consider trying your request again' }; // in about an hour.
    }

    // 5 request per hour
    if(rateLimitUserData.no_of_request >= MAX_REQUEST) {
        const data = { no_of_request: 0, date_of_request: null, time_to_rest: currentDate };
        listOfRequestMade[userId] = data;

        return { message: 'I apologize, but we are currently managing our server\'s workload to ensure the best service for all our users. Due to our current capacity, we may not be able to accommodate excessive requests at this time. Please consider trying your request again' }; // in about an hour.
    }

    const timeSpanOfRequest = currentDate - rateLimitUserData.date_of_request;
    if(timeSpanOfRequest > SHORT_REST) {
        const noOfRequest = rateLimitUserData.no_of_request + 1;
        const data = { no_of_request: noOfRequest, date_of_request: currentDate, time_to_rest: null };
        listOfRequestMade[userId] = data;
        return { message: null }; // passed
    } else {
        return { message: 'Too many requests. Please try your request again in about a minute.' };
    }
}

// remove unused user data in a day
const cleanUp = () => {
    const A_DAY = 1000 * 60 * 60 * 24;
    const currentDate = Date.now();
    for(const userId in listOfRequestMade) {
        const userData = listOfRequestMade[userId];
        const { date_of_request, time_to_rest } = userData;

        /*
            I modified this part to get the last time the user tries to send
            a request, since I reset the date_of_request to null once the user
            reached the max number of request it can made, and time_to_rest holds
            the current date of that last request to define that requesting to a
            certain time is limited
        */
        const lastTimeAttemp = time_to_rest ? time_to_rest : date_of_request;

        /*
            if the current date subtract by null it will return the current date,
            so that is not proper in this case. The above line of code might solve
            this problem
        */
        const timeSpan = currentDate - lastTimeAttemp;
        if(timeSpan > A_DAY) {
            delete listOfRequestMade[userId];
        }
    }
}



// export const rateLimit = async (userId) => {
//     console.log('init');
//     const promises = () => {
//         let internal = null;
//         const external = new Promise(sResolve => {
//             internal = new Promise(fResolve => {
//                     setTimeout(() => {
//                         fResolve('akala ko simple lang eh');
//                         sResolve();
//                     }, 20_000);
//                 }
//             );
//         });

//         return { external, internal };
//     }

//     const promiseToFulfill = promises();
    
//     stackRequest.push(promiseToFulfill?.external);
//     for(const externalPromise of stackRequest) {
//         console.log('another request ');
//         await externalPromise;
//     }

//     return await promiseToFulfill?.internal;
// }

// function promiseResponse(userId) {
//     let internal = null;
//     const external = new Promise(sResolve => {
//         internal = new Promise(fResolve => {
//                 slotOfRequest(userId, fResolve, sResolve);
//             }
//         );
//     });

//     return { external, internal };
// }