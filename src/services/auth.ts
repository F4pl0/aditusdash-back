import { Service, Container } from 'typedi';
import jwt from 'jsonwebtoken';
import config from '../config';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import {Logger} from "winston";
import {IUser, IUserRegisterDTO} from "../interfaces/IUser";
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

@Service()
export default class AuthService {

    logger: Logger = Container.get('logger');
    userModel: Models.UserModel = Container.get('userModel');

    constructor(
    ) {}

    public async Register(userRegisterDTO: IUserRegisterDTO): Promise<{ user?: IUser; token?: string, success: boolean, reason? }> {
        try {
            const salt = randomBytes(32);

            this.logger.silly('Hashing password');
            const hashedPassword = await argon2.hash(userRegisterDTO.pass, { salt });
            this.logger.debug('Hashed Password: ' + hashedPassword);
            this.logger.silly('Creating user db record');
            const userRecord = await this.userModel.create({
                ...userRegisterDTO,
                salt: salt.toString('hex'),
                pass: hashedPassword,
            });
            this.logger.silly('Generating JWT');
            const token = this.generateToken(userRecord);

            if (!userRecord) {
                // User cannot be created
                return { success: false, reason: 0 };
            }

            /**
             * @TODO This is not the best way to deal with this
             * There should exist a 'Mapper' layer
             * that transforms data from layer to layer
             * but that's too over-engineering for now
             */
            const user = userRecord.toObject();
            Reflect.deleteProperty(user, 'pass');
            Reflect.deleteProperty(user, 'salt');
            return { user, token, success: true };
        } catch (e) {
            this.logger.error(e);
            // Mystery error
            return { success: false, reason: 1 };
        }
    }

    public async Login(email: string, pass: string): Promise<{ user?: IUser; token?: string, success: boolean, reason? }> {
        const userRecord = await this.userModel.findOne({ email });
        if (!userRecord) {
            // User does not exist
            return { success: false, reason: 0 };
        }
        this.logger.silly('Checking password');
        //this.logger.debug('Verifying ' + userRecord.pass + ' with entered password: ' + pass);
        const validPassword = await argon2.verify(userRecord.pass, pass);
        if (validPassword) {
            this.logger.silly('Password is valid!');
            this.logger.silly('Generating JWT');
            const token = this.generateToken(userRecord);

            const user = userRecord.toObject();
            Reflect.deleteProperty(user, 'pass');
            Reflect.deleteProperty(user, 'salt');
            /**
             * Easy as pie, you don't need passport.js anymore :)
             */
            return { user, token, success: true };
        } else {
            // Invalid Password
            return { success: false, reason: 1 };
        }
    }

    public async MakeAdmin(_id): Promise<{ success: boolean, reason? }> {
        const userRecord = await this.userModel.findOne({ _id, admin: false });
        if (!userRecord) {
            // User does not exist
            return { success: false, reason: 0 };
        }

        userRecord.admin = true;
        await userRecord.save();

        return { success: true };
    }

    public async DeleteUser(_id): Promise<{ success: boolean, reason? }> {
        const userRecord = await this.userModel.deleteOne({ _id, admin: false});
        return { success: !!userRecord };
    }

    public async GetAllUsers(): Promise<{ users?: IUser[], success: boolean, reason? }> {
        try {
            const userRecords = await this.userModel.find();

            userRecords.forEach( user => {
                Reflect.deleteProperty(user, 'pass');
                Reflect.deleteProperty(user, 'salt');
            });

            return { users: userRecords, success: true };
        } catch (e) {
            return { success: false, reason: 0 };
        }

    }

    private generateToken(user: IUser) {
        const today = new Date();
        const exp = new Date(today);
        exp.setDate(today.getDate() + 60);

        this.logger.silly(`Sign JWT for userId: ${user._id}`);
        return jwt.sign(
            {
                _id: user._id, // We are gonna use this in the middleware 'isAuth'
                name: user.name,
                admin: user.admin,
                exp: exp.getTime() / 1000,
            },
            config.jwtSecret,
        );
    }
}
