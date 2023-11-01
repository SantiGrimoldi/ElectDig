const mqtt = require("mqtt");
const { MongoClient } = require("mongodb");
const config = require("./config");

const mqttUri = `mqtt://${config.mqtt.hostname}:${config.mqtt.port}`;
const mqttClient = mqtt.connect(mqttUri);

const mongoUri = 'mongodb://127.0.0.1:27017';
const date_time = new Date();
const client = new MongoClient(mongoUri);
const database = client.db('elect_dig');
const messageCollection = database.collection('message');

mqttClient.on("connect", () => {
    mqttClient.subscribe("#", (err) => {
        if (!err) {
            console.log("MQTT Client connected");
        }
    });
});

mqttClient.on("message", async (topic, message) => {
    try {
        if (topic === 'message') {
            const result = await messageCollection.insertOne(message);
            console.log(`MongoDB Document Inserted with _id: ${result.insertedId}`);
        }
        else {
           await search()

        }
    } catch (err) {
        console.error(`Error: ${err}`);
    }
});

async function saveOnDb (message) {
    const doc = {
        fecha: date_time,
        content: message.toString(),
    };
}
async function search() {
    const result = await messageCollection.findOne();
    console.log(`MongoDB Document Inserted with _id: ${result.insertedId}`);
}