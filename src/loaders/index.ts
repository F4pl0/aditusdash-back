import expressLoader from './express';
import mongooseLoader from './mongoose';
import dependencyInjectorLoader from './dependencyInjector';
import Logger from './logger';
import {Express} from "express";
import mqtt from "./mqtt";
import {Container} from "typedi";

export default async ({ expressApp } : {expressApp:Express}) => {

    await mongooseLoader();
    Logger.info('DB loaded and connected!');

    const userModel = {
        name: 'userModel',
        model: require('../models/user').default,
    };

    const machineModel = {
        name: 'machineModel',
        model: require('../models/machine').default,
    };

    const dayModel = {
        name: 'dayModel',
        model: require('../models/day').default,
    };


    // It returns the agenda instance because it's needed in the subsequent loaders
    await dependencyInjectorLoader({models: [
            userModel,
            machineModel,
            dayModel
        ],
    });
    Logger.info('Dependency Injector loaded');

    await expressLoader({ app: expressApp });

    Logger.info('Express loaded');

    await mqtt();

    Logger.info('MQTT loaded');
};
