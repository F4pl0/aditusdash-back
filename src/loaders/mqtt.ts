import Logger from "./logger";
import {MqttClient} from "mqtt";
import {Container} from "typedi";
import MachineService from "../services/machine";
import config from "../config";

export default async (): Promise<MqttClient> => {

    const machineServiceInstance = Container.get<MachineService>(MachineService);

    Logger.debug('Connecting MQTT...');
    var mqtt = require('mqtt');
    var options = {
        port: config.mqtt_port,
        clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
        username: config.mqtt_username,
        password: config.mqtt_password,
        keepalive: 60,
        reconnectPeriod: 1000,
        protocolId: 'MQIsdp',
        protocolVersion: 3,
        clean: true,
        encoding: 'utf8'
    };

    var client = mqtt.connect(config.mqtt_url, options);
    Container.set('mqtt', client);

    client.on('connect', function() { // When connected
        Logger.debug('MQTT Connected');

        client.subscribe('aditusCommMachine', function (err) {
            if (!err) {
                //client.publish('aditusCommMaster', 'pusi ga toni')
            }
        })
    });

    client.on('message', function (topic, message) {

        Logger.debug('MQTT Received Message: '+ message.toString());
        const msg = JSON.parse(message.toString());

        switch (msg.status) {
            case 'sales':
                const res = {
                    from: 'master',
                    _id: msg._id,
                    sales: msg.sales,
                    date: msg.date,
                    status: 'ackSales'
                };

                machineServiceInstance.ReceiveMQTTUpdate(msg._id, new Date(msg.date), msg.sales);

                client.publish('aditusCommMaster', JSON.stringify(res));
                break;
            case 'ackUpdate':
                machineServiceInstance.AckRestock();
                break;
        }

    })

    return client;
};
