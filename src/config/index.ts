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
    mqtt_port: process.env.MQTT_PORT || 13916,
    mqtt_username: process.env.MQTT_USERNAME || "",
    mqtt_password: process.env.MQTT_PASSWORD || "",
    mqtt_url: process.env.MQTT_URL || ""
};
