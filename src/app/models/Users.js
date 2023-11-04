import mongoose, { Schema } from 'mongoose';
import connectToDatabase from '../../../utils/databaseConnection';

mongoose.Promise = global.Promise;
connectToDatabase();

const userSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },

    lastname: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;