import mongoose from 'mongoose';

const connectToDatabase = async () => {
    try {
        console.log('database connection status: ', mongoose.STATES[mongoose.connection.readyState]);
        if(mongoose.connection.readyState == 0) // is disconnected
            await mongoose.connect(process.env.MONGODB_URI);

        console.log('database connection status: ', mongoose.STATES[mongoose.connection.readyState]);
    } catch(error) {
        console.log(error);
    }
}

export default connectToDatabase;