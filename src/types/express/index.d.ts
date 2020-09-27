import { Document, Model } from 'mongoose';
import { IUser } from '../../interfaces/IUser';
import {IMachine} from "../../interfaces/IMachine";
import {ISale} from "../../interfaces/ISale";

declare global {
    namespace Express {
        export interface Request {
            currentUser: IUser & Document;
        }
    }

    namespace Models {
        export type UserModel = Model<IUser & Document>;
        export type MachineModel = Model<IMachine & Document>;
        export type SaleModel = Model<ISale & Document>;
    }
}
