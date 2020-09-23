import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (envFound.error) {
    throw new Error("Couldn't find .env file");
}

export default {
    port: parseInt(process.env.PORT || '3000', 10),
    databaseURL: process.env.MONGODB_URI || "",
    jwtSecret: process.env.JWT_SECRET || "",
    logs: {
        level: process.env.LOG_LEVEL || 'silly',
    },
    mailerPass: process.env.MAIL_PASS || "",
    mailerUser: process.env.MAIL_USER || "",
    mailerSender: process.env.MAIL_SENDFROM || "noreply@arijakidscontest.com",
};
