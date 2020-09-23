
import jwt from 'express-jwt';
import config from '../../config';

const getTokenFromHeader = req => {
    console.log(config.jwtSecret);
    return req.headers.authorization;
};

const isAuth = jwt({
    secret: config.jwtSecret, // The _secret_ to sign the JWTs
    userProperty: 'token', // Use req.token to store the JWT
    getToken: getTokenFromHeader, // How to extract the JWT from the request
    algorithms: ['HS256']
});

export default isAuth;
