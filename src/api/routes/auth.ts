import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import AuthService from '../../services/auth';
import { celebrate, Joi } from 'celebrate';
import { Logger } from "winston";
import {IUserRegisterDTO} from "../../interfaces/IUser";
import isAuth from "../middlewares/isAuth";
import isAdmin from "../middlewares/isAdmin";

const route = Router();

export default (app: Router) => {
    app.use('/auth', route);
    const logger : Logger = Container.get('logger');
    const authServiceInstance = Container.get<AuthService>(AuthService);

    route.post(
        '/register',
        isAuth,
        isAdmin,
        celebrate({
            body: Joi.object({
                name: Joi.string().required(),
                email: Joi.string().required(),
                pass: Joi.string().required(),
                admin: Joi.boolean().required()
            }),
        }),
        async (req: Request, res: Response, next: NextFunction) => {
            logger.debug('Calling Register endpoint with body: %o', req.body )
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

    route.post(
        '/deleteUser',
        isAuth,
        isAdmin,
        celebrate({
            body: Joi.object({
                _id: Joi.string().required(),
            }),
        }),
        async (req: Request, res: Response, next: NextFunction) => {
            logger.debug('Calling Delete User endpoint with body: %o', req.body)
            try {
                const { success, reason } = await authServiceInstance.DeleteUser(req.body._id);
                if(success) {
                    return res.status(201).json({ success: true });
                } else {
                    return res.status(200).json({ message: 'Serverska greska' });
                }
            } catch (e) {
                logger.error(' error: %o',  e );
                return next(e);
            }
        },
    );

    route.post(
        '/makeAdmin',
        isAuth,
        isAdmin,
        celebrate({
            body: Joi.object({
                _id: Joi.string().required(),
            }),
        }),
        async (req: Request, res: Response, next: NextFunction) => {
            logger.debug('Calling Delete User endpoint with body: %o', req.body)
            try {
                const { success, reason } = await authServiceInstance.MakeAdmin(req.body._id);
                if(success) {
                    return res.status(201).json({ success: true });
                } else {
                    return res.status(200).json({ message: 'Serverska greska' });
                }
            } catch (e) {
                logger.error(' error: %o',  e );
                return next(e);
            }
        },
    );

    route.get(
        '/getAll',
        isAuth,
        isAdmin,
        async (req: Request, res: Response, next: NextFunction) => {
            logger.debug('Calling GetAllUsers endpoint with body: %o', req.body)
            try {
                const { users, success, reason } = await authServiceInstance.GetAllUsers();
                if(success) {
                    return res.status(201).json({ users });
                } else {
                    switch (reason) {
                        case 0:
                            return res.status(200).json({ message: 'Serverska Greska' });
                    }
                }
            } catch (e) {
                logger.error(' error: %o',  e );
                return next(e);
            }
        },
    );
};


