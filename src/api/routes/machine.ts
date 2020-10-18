import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { celebrate, Joi } from 'celebrate';
import { Logger } from "winston";
import isAuth from "../middlewares/isAuth";
import {IMachineNewDTO, IMachineRestockDTO, IMachineUpdateDTO} from "../../interfaces/IMachine";
import MachineService from "../../services/machine";

const route = Router();

export default (app: Router) => {
    app.use('/machine', route);
    const logger : Logger = Container.get('logger');
    const machineServiceInstance = Container.get<MachineService>(MachineService);


    route.get(
        '/getAll',
        isAuth,
        async (req: Request, res: Response, next: NextFunction) => {
            logger.debug('Calling GetAll Machines endpoint' )
            try {
                const { machines, success, reason } = await machineServiceInstance.GetAll();
                if(success) {
                    return res.status(201).json({ machines });
                } else {
                    switch (reason) {
                        case 1:
                            return res.status(200).json({ message: 'Serverska greška. Pokušajte ponovo kasnije.' });
                    }
                }
            } catch (e) {
                logger.error('error: %o', e);
                return next(e);
            }
        },
    );

    route.post(
        '/new',
        celebrate({
            body: Joi.object({
                location: Joi.string().required(),
                image: Joi.string().required(),
                item: Joi.string().required(),
                stock: Joi.number().required(),
                maxStock: Joi.number().required(),
                price: Joi.number().required(),
                locationPrice: Joi.number().required(),
            }),
        }),
        isAuth,
        async (req: Request, res: Response, next: NextFunction) => {
            logger.debug('Calling New Machine endpoint with body: %o', req.body )
            try {
                const { machine, success, reason } = await machineServiceInstance.New(req.body as IMachineNewDTO);
                if(success) {
                    return res.status(201).json({ machine });
                } else {
                    switch (reason) {
                        case 0:
                            return res.status(200).json({ message: 'Nije moguce kreirati masinu, posukajte ponovo kasnije.' });
                        case 1:
                            return res.status(200).json({ message: 'Serverska greška. Pokušajte ponovo kasnije.' });
                    }
                }
            } catch (e) {
                logger.error('error: %o', e);
                return next(e);
            }
        },
    );

    route.post(
        '/update',
        celebrate({
            body: Joi.object({
                _id: Joi.string().required(),
                location: Joi.string().required(),
                image: Joi.string().required(),
                item: Joi.string().required(),
                stock: Joi.number().required(),
                maxStock: Joi.number().required(),
                price: Joi.number().required(),
                locationPrice: Joi.number().required(),
            }),
        }),
        isAuth,
        async (req: Request, res: Response, next: NextFunction) => {
            logger.debug('Calling New Machine endpoint with body: %o', req.body )
            try {
                const { success, reason } = await machineServiceInstance.Update(req.body as IMachineUpdateDTO);
                if(success) {
                    return res.status(201).json({ success: true });
                } else {
                    switch (reason) {
                        case 0:
                            return res.status(200).json({ message: 'Nije moguce izmeniti masinu, posukajte ponovo kasnije.' });
                        case 1:
                            return res.status(200).json({ message: 'Serverska greška. Pokušajte ponovo kasnije.' });
                    }
                }
            } catch (e) {
                logger.error('error: %o', e);
                return next(e);
            }
        },
    );

    route.post(
        '/delete',
        celebrate({
            body: Joi.object({
                _id: Joi.string().required(),
            }),
        }),
        isAuth,
        async (req: Request, res: Response, next: NextFunction) => {
            logger.debug('Calling Delete Machine endpoint with body: %o', req.body )
            try {
                const { success, reason } = await machineServiceInstance.Delete(req.body._id);
                if(success) {
                    return res.status(201).json({ success: true });
                } else {
                    switch (reason) {
                        case 1:
                            return res.status(200).json({ message: 'Serverska greška. Pokušajte ponovo kasnije.' });
                    }
                }
            } catch (e) {
                logger.error('error: %o', e);
                return next(e);
            }
        },
    );

    route.post(
        '/updateDay',
        celebrate({
            body: Joi.object({
                machine: Joi.string().required(),
                date: Joi.string().required(),
            }),
        }),
        async (req:Request, res: Response, next: NextFunction) => {
            logger.debug('Calling UpdateDay endpoint with body: %o', req.body )
            try {
                // @ts-ignore
                req.files.csv.mv('../uploads/'+req.body.machine+'_'+req.body.date+'.csv');
                const { success, reason } = await machineServiceInstance.UpdateDay(req.body.machine, new Date(req.body.date), 'https://api.365aditus.com/api/machine/csv/'+req.body.machine+'_'+req.body.date+'.csv');
                if(success) {
                    return res.status(201).json({ success: true });
                } else {
                    switch (reason) {
                        case 0:
                            return res.status(200).json({ message: 'Nepostojeca masina.' });
                        case 1:
                            return res.status(200).json({ message: 'Serverska greška. Pokušajte ponovo kasnije.' });
                    }
                }
            } catch (e) {
                logger.error('error: %o', e);
                return next(e);
            }
        },
    );

    route.get(
        '/csv/:csv',
        async (req: Request, res: Response, next: NextFunction) => {

            // Relative path file sending flaw, needs to be patched al me mrzi
            res.sendFile('/root/uploads/'+req.params.csv);
        },
    );

    route.post(
        '/get',
        celebrate({
            body: Joi.object({
                _id: Joi.string().required(),
            }),
        }),
        async (req: Request, res: Response, next: NextFunction) => {
            logger.debug('Calling Get Machine endpoint with body: %o', req.body )
            try {
                const { machine, success, reason } = await machineServiceInstance.Get(req.body._id);
                if(success) {
                    return res.status(201).json({ machine, success: true });
                } else {
                    switch (reason) {
                        case 1:
                            return res.status(200).json({ message: 'Serverska greška. Pokušajte ponovo kasnije.' });
                    }
                }
            } catch (e) {
                logger.error('error: %o', e);
                return next(e);
            }
        },
    );



    route.post(
        '/restock',
        celebrate({
            body: Joi.object({
                _id: Joi.string().required(),
                stock: Joi.number().required()
            }),
        }),
        isAuth,
        async (req: Request, res: Response, next: NextFunction) => {
            logger.debug('Calling Restock Machine endpoint with body: %o', req.body )
            try {
                const { success, reason } = await machineServiceInstance.Restock(req.body as IMachineRestockDTO);
                if(success) {
                    return res.status(201).json({ success: true });
                } else {
                    switch (reason) {
                        case 0:
                            return res.status(200).json({ message: 'Nepostojeca masina' });
                        case 1:
                            return res.status(200).json({ message: 'Serverska greška. Pokušajte ponovo kasnije.' });
                        case 2:
                            return res.status(200).json({ message: 'Masina Nedostupna. Pokusajte ponovo kasnije.' });
                        case 3:
                            return res.status(200).json({ message: 'Restock je u toku. Pokušajte ponovo kasnije.' });
                    }
                }
            } catch (e) {
                logger.error('error: %o', e);
                return next(e);
            }
        },
    );
};


