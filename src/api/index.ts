import { Router } from 'express';
import auth from './routes/auth';
import machine from "./routes/machine";

// guaranteed to get dependencies
export default () => {
    const app = Router();

    auth(app);
    machine(app);

    return app
}
