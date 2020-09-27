import mongoose from 'mongoose';
import {ISale} from "../interfaces/ISale";

const Sale = new mongoose.Schema(
    {
        machine: {type: mongoose.Schema.Types.ObjectId, ref: 'Machine'},

        date: {
            type: Date
        }
    },
    { timestamps: true },
);

export default mongoose.model<ISale & mongoose.Document>('Sale', Sale);
