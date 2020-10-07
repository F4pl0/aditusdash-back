import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from '../api';
import { ErrorCodes } from '../constants';
import fileUpload from 'express-fileupload';

export default ({ app }: { app: express.Application }) => {

    // Health check endpoints
    app.get('/status', (req, res) => {
        res.status(200).end();
    });
    app.head('/status', (req, res) => {
        res.status(200).end();
    });

    // The magic package that prevents frontend developers going nuts
    // Alternate description:
    // Enable Cross Origin Resource Sharing to all origins by default
    app.use(cors());

    // Middleware that transforms the raw string of req.body into json
    app.use(bodyParser.json());

    // Enable file upload
    app.use(fileUpload({
        createParentPath: true
    }));

    // Load API routes
    app.use('/api', routes());

    // Remove X-Powered-By Header
    // It's a bit revealing, isn't it?
    app.use((req, res, next) => {
        res.removeHeader("X-Powered-By");
        next();
    });

    // catch 404 and forward to error handler
    app.use((req, res, next) => {
        const err = new Error('Not Found');
        err['status'] = 404;
        next(err);
    });

    /// Error Handlers
    app.use((err, req, res, next) => {
        /**
         * Handle 401 thrown by express-jwt library
         */
        if (err.status === ErrorCodes.UNAUTHORIZED) {
            return res
                .status(err.status)
                .json({
                    errorCode: ErrorCodes.UNAUTHORIZED,
                    message: "Unauthorized"
                });
        } else if (err.status === ErrorCodes.NOT_FOUND) {
            return res
                .status(err.status)
                .json({
                    errorCode: ErrorCodes.NOT_FOUND,
                    message: "Not found"
                });
        }
        if (err.joi) {
            return res
                .status(ErrorCodes.BAD_REQUEST)
                .json({
                    errorCode: ErrorCodes.PARAMETERS_NOT_STATISFIED,
                    message: err.joi.message
                });
        }
        return next(err);
    });

    app.use((err: any, req: Request, res: Response) => {
        res.status(err.status || 500);
        res.json({
            errors: {
                message: err.message,
            },
        });
    });
};
