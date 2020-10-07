import mongoose from 'mongoose';
import {IDay} from "../interfaces/IDay";

const Day = new mongoose.Schema(
    {
        machine: {type: mongoose.Schema.Types.ObjectId, ref: 'Machine'},

        date: {
            type: Date
        },
        sales: {
            type: Number
        },
        price: {
            type: Number
        },
        csvUrl: {
            type: String
        }
    },
    { timestamps: true },
);

export default mongoose.model<IDay & mongoose.Document>('Day', Day);
