const mqtt = require("mqtt");
const { MongoClient } = require("mongodb");
const config = require("./config");
const {splitPath} = require("./PathManager");
const {write_database, add_product, read_all_products, read_product, repose_product} = require("./DBWriter");

const mqttUri = `mqtt://${config.mqtt.hostname}:${config.mqtt.port}`;
const mqttClient = mqtt.connect(mqttUri);

const mongoUri = 'mongodb://127.0.0.1:27017';
const date_time = new Date();
const client = new MongoClient(mongoUri);
const database = client.db('elect_dig');
const messageCollection = database.collection('message');

mqttClient.on("connect", () => {
    mqttClient.subscribe("AustralFI/inel15/#", (err) => {
        if (!err) {
            console.log("MQTT Client connected");
        }
    });
});

mqttClient.on("message", async (topic, message) => {
    try {
        const action = splitPath(topic, 2)
        switch (action) {
            case "get" : {
                await mqttClient.publish("AustralFI/inel15/receive/get", JSON.stringify(await read_product(topic)));
                break
            }
            case "buy" : {
                await mqttClient.publish("AustralFI/inel15/receive/buy", JSON.stringify(await write_database(topic, message)));
                break
            }
            case "repose" : {
                await mqttClient.publish("AustralFI/inel15/receive/repose", JSON.stringify(await repose_product(topic, message)));
                break
            }
            case "add" : {
                await  mqttClient.publish("AustralFI/inel15/receive/add", JSON.stringify(await add_product(topic, message)));
                break
            }
            case "getAll" : {
                await mqttClient.publish("AustralFI/inel15/receive/getAll", JSON.stringify(await read_all_products()));
                break
            }
            default : {
                break
            }
        }
    } catch (err) {
        console.error(`Error: ${err}`);
    }
});


// if (topic === "AustralFI/inel15/get") {
//     console.log(await messageCollection.find().sort({fecha : -1}).limit(1).next());
// }
// else{
//     const doc = {
//         fecha: date_time,
//         content: message.toString(),
//     };
//
//     const result = await messageCollection.insertOne(doc);
//     console.log(topic);
//     console.log(`MongoDB Document Inserted with _id: ${result.insertedId}`);
// }