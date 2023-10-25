const mqtt = require("mqtt");
const { MongoClient } = require("mongodb");
const config = require("./config");

const mqttUri = `mqtt://${config.mqtt.hostname}:${config.mqtt.port}`;
const mqttClient = mqtt.connect(mqttUri);

const mongoUri = "mongodb://127.0.0.1:27017";
const date_time = new Date();
const client = new MongoClient(mongoUri);
const database = client.db(config.mongodb.database);
const messageCollection = database.collection("message");

mqttClient.on("connect", () => {
    mqttClient.subscribe("#", (err) => {
        if (!err) {
            console.log("MQTT Client connected");
        }
    });
});

mqttClient.on("message", async (topic, message) => {
    try {
        const doc = {
            fecha: date_time,
            content: message.toString(),
        };

        const result = await messageCollection.insertOne(doc);

        console.log(`MongoDB Document Inserted with _id: ${result.insertedId}`);
    } catch (err) {
        console.error(`Error: ${err}`);
    }
});
