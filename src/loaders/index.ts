import expressLoader from './express';
import mongooseLoader from './mongoose';
import dependencyInjectorLoader from './dependencyInjector';
import Logger from './logger';
import {Express} from "express";

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

    const saleModel = {
        name: 'saleModel',
        model: require('../models/sale').default,
    };


    // It returns the agenda instance because it's needed in the subsequent loaders
    await dependencyInjectorLoader({models: [
            userModel,
            machineModel,
            saleModel
        ],
    });
    Logger.info('Dependency Injector loaded');

    await expressLoader({ app: expressApp });
    Logger.info('Express loaded');
};
