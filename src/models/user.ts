import { IUser } from '../interfaces/IUser';
import mongoose from 'mongoose';

const User = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter a full name'],
        },

        email: {
            type: String,
            lowercase: true,
            unique: true,
        },

        admin: {
            type: Boolean
        },

        pass: String,
        salt: String,
    },
    { timestamps: true },
);

export default mongoose.model<IUser & mongoose.Document>('User', User);
