import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import AuthService from '../../services/auth';
import { celebrate, Joi } from 'celebrate';
import { Logger } from "winston";
import {IUserRegisterDTO} from "../../interfaces/IUser";

const route = Router();

export default (app: Router) => {
    app.use('/machine', route);
    const logger : Logger = Container.get('logger');
    const authServiceInstance = Container.get<AuthService>(AuthService);

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
        async (req: Request, res: Response, next: NextFunction) => {
            logger.debug('Calling New Machine endpoint with body: %o', req.body )
            try {
                const { user, token, success, reason } = await authServiceInstance.Register(req.body as IUserRegisterDTO);
                if(success) {
                    return res.status(201).json({ user, token });
                } else {
                    switch (reason) {
                        case 0:
                            return res.status(200).json({ message: 'Korisnik ne može da se registruje. Pokušajte ponovo kasnije.' });
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
        '/login',
        celebrate({
            body: Joi.object({
                email: Joi.string().required(),
                pass: Joi.string().required(),
            }),
        }),
        async (req: Request, res: Response, next: NextFunction) => {
            logger.debug('Calling Login endpoint with body: %o', req.body)
            try {
                const { email, pass } = req.body;
                const { user, token, success, reason } = await authServiceInstance.Login(email, pass);
                if(success) {
                    return res.status(201).json({ user, token });
                } else {
                    switch (reason) {
                        case 0:
                            return res.status(200).json({ message: 'Korisnik nije registrovan' });
                        case 1:
                            return res.status(200).json({ message: 'Lozinka nije tačna' });
                    }
                }
            } catch (e) {
                logger.error(' error: %o',  e );
                return next(e);
            }
        },
    );
};


