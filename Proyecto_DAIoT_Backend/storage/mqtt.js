var fs = require('fs');
var mqtt = require('mqtt');
const config = require("./../config");

const MQTT_ENV = config.services.MQTT;

// var options = {
//     clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
//     rejectUnauthorized: true,
//     username: MQTT_ENV.USERNAME,
//     password: MQTT_ENV.PASSWORD,
//     qos: 2,
//     port: MQTT_ENV.PORT,
//     clean: true
// }
// const URI = `mqtts://${MQTT_ENV.HOST}`;
// console.log("MQTT:" + URI);

var options = {
    host: MQTT_ENV.HOST,
    port: MQTT_ENV.PORT,
    protocol: "mqtts",
    clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    ca: fs.readFileSync("./certs/ca.crt"),
    cert: fs.readFileSync("./certs/client.crt"),
    key: fs.readFileSync("./certs/client.key"),
    rejectUnauthorized: false,
    clean: true
};

const client = mqtt.connect(options);

var arrayTopicsListen = [];
var arrayTopicsServer = [];
// connected
client.on('connect', function () {
    console.log("[MQTT] Init: Connected");
});
//handle errors
client.on("error", function (error) {
    console.log("[MQTT] Error: OCURRIÓ UN PROBLEMA: " + error);
});

client.MQTTOptions = options;
module.exports = client;