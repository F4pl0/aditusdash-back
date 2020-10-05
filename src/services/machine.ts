import { Service, Container } from 'typedi';
import jwt from 'jsonwebtoken';
import config from '../config';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import {Logger} from "winston";
import {IUser, IUserRegisterDTO} from "../interfaces/IUser";
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import {IMachine, IMachineNewDTO, IMachineRestockDTO, IMachineUpdateDTO} from "../interfaces/IMachine";
import {MqttClient} from "mqtt";
import delay from "delay";

@Service()
export default class MachineService {

    logger: Logger = Container.get('logger');
    userModel: Models.UserModel = Container.get('userModel');
    machineModel: Models.MachineModel = Container.get('machineModel');

    waitingForRestock: boolean = false;

    mqd = {
        ack: false
    }


    constructor(
    ) {}

    public async GetAll(): Promise<{ machines?: IMachine[], success: boolean, reason? }> {
        try {
            const machineRecords = await this.machineModel.find({});

            return { machines: machineRecords, success: true };
        } catch (e) {
            this.logger.error(e);
            // Mystery error
            return { success: false, reason: 1 };
        }
    }

    public async New(machineNewDTO: IMachineNewDTO): Promise<{ machine?: IMachine, success: boolean, reason? }> {
        try {
            const machineRecord = await this.machineModel.create({
                ...machineNewDTO,
            });

            if (!machineRecord) {
                // User cannot be created
                return { success: false, reason: 0 };
            }

            const machine = machineRecord.toObject();
            return { machine, success: true };
        } catch (e) {
            this.logger.error(e);
            // Mystery error
            return { success: false, reason: 1 };
        }
    }

    public async Delete(machineID: string): Promise<{ success: boolean, reason? }> {
        try {
            await this.machineModel.deleteOne( {
                _id: machineID
            });
            return { success: true };
        } catch (e) {
            this.logger.error(e);
            // Mystery error
            return { success: false, reason: 1 };
        }
    }

    public async Update(machineUpdateDTO: IMachineUpdateDTO): Promise<{ success: boolean, reason? }> {
        try {
            const machineRecord = await this.machineModel.findOne({_id: machineUpdateDTO._id});

            if (!machineRecord) {
                // User cannot be created
                return { success: false, reason: 0 };
            }

            machineRecord.location = machineUpdateDTO.location;
            machineRecord.image = machineUpdateDTO.image;
            machineRecord.item = machineUpdateDTO.item;
            machineRecord.stock = machineUpdateDTO.stock;
            machineRecord.price = machineUpdateDTO.price;
            machineRecord.maxStock = machineUpdateDTO.maxStock;
            machineRecord.locationPrice = machineUpdateDTO.locationPrice;

            await machineRecord.save();

            return { success: true };
        } catch (e) {
            this.logger.error(e);
            // Mystery error
            return { success: false, reason: 1 };
        }
    }

    public async Restock(machineRestockDTO: IMachineRestockDTO): Promise<{ success: boolean, reason? }> {
        try {
            const machineRecord = await this.machineModel.findOne({_id: machineRestockDTO._id});

            if (!machineRecord) {
                // User cannot be created
                return { success: false, reason: 0 };
            }

            if (this.waitingForRestock) {
                return { success: false, reason: 3 }
            }

            this.mqd.ack = false;

            this.waitingForRestock = true;

            const restockRes = await this.SendMQTTRestock(machineRestockDTO);

            this.logger.debug('Received Restock Res: '+restockRes);
            this.waitingForRestock = false;

            if(restockRes) {
                machineRecord.stock = machineRestockDTO.stock;
                await machineRecord.save();
                return { success: true };
            }

            return { success: false, reason: 2 };

        } catch (e) {
            this.logger.error(e);
            // Mystery error
            return { success: false, reason: 1 };
        }
    }

    public async Get( _id ): Promise<{ machine?: any, success: boolean, reason? }> {
        try {
            const machineRecord = await this.machineModel.findOne({
                _id
            });

            return { machine: machineRecord, success: true };
        } catch (e) {
            this.logger.error(e);
            // Mystery error
            return { success: false, reason: 1 };
        }
    }

    public async SendMQTTRestock(machineRestockDTO: IMachineRestockDTO): Promise<boolean> {
        const mqtt: MqttClient = Container.get('mqtt');

        var tries = 0;

        var mqd = this.mqd;

        var ackd = false;

        while(!(await (async function waitForFoo(){

            if (mqd.ack){
                ackd = true;
                return true;
            }
            if (tries == 5) return true;
            tries += 1;

            mqtt.publish('aditusCommMaster', JSON.stringify({
                from: 'master',
                _id: machineRestockDTO._id,
                stock: machineRestockDTO.stock,
                status: 'update'
            }));

            await delay(1000);
        })())){
            this.logger.debug('asd');
        }

        return ackd;
        /*
        Send:
        {
            "from": "master",
            "_id": "id",
            "stock": 56,
            "status": "update"
        }
        Receive:
        {
            "from": "slave",
            "_id": "id",
            "stock": 56,
            "status": "ackUpdate"
        }
        */
    }

    public async ReceiveMQTTUpdate(_id: string, date: Date, stockLeft: number): Promise<void> {
        /*
        Receive:
        {
            "from": "slave",
            "_id": "id",
            "stockLeft": 14,
            "date": <date>,
            "status": "sales"
        }
        Send:
        {
            "from": "master",
            "_id": "id",
            "stockLeft": 14,
            "date": <date>,
            "status": "ackSales"
        }
        */
    }

    public AckRestock(): void {
        this.mqd.ack= true;
        this.logger.debug('Received ACK for restock');
    }
}
