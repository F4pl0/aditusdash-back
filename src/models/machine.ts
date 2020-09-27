import { IMachine } from '../interfaces/IMachine';
import mongoose from 'mongoose';

const Machine = new mongoose.Schema(
    {
        location: {
            type: String,
            required: [true, 'Unesite lokaciju'],
        },

        item: {
            type: String
        },
        image: {
            type: String
        },
        stock: {
            type: Number
        },
        maxStock: {
            type: Number
        },
        price: {
            type: Number
        },
        locationPrice: {
            type: Number
        }
    },
    { timestamps: true },
);

export default mongoose.model<IMachine & mongoose.Document>('Machine', Machine);
