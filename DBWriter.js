
const {MongoClient} = require("mongodb");
const {splitPath} = require("./PathManager");
const mongoUri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(mongoUri);
const database = client.db('elect_dig');
const messageCollection = database.collection('vending_machine');

async function write_database(topic, message){
    const product = splitPath(topic, -1)
    try {
        const before = await messageCollection.findOne(
            {title: product}
        )
        if (before.qty < 0) return "No hay stock";
        await messageCollection.updateOne(
            {title: product},
            {$inc: {qty: parseInt(message.toString())}}
        )
        return "Compra exitosa";
    } catch (e) {
        return e.message
    }
}

async function add_product(topic, message) {
    const product = message.toString().split(",");
    try {
        await messageCollection.insertOne(
            {
                title: product[0],
                qty: parseInt(product[1])
            }
        )
        return "Producto agregado"
    } catch (e) {
        return e
    }
}

async function read_product(topic) {
    const product = splitPath(topic, -1)
    try {
        return await messageCollection.findOne(
            {title: product}
        );
    } catch (e) {
        return e
    }
}

async function read_all_products() {
    const result = await messageCollection.find().toArray()
    try {
        const quantities = []
        result.forEach(element => {
            quantities.push({
                title: element.title,
                qty: element.qty
            })
        });
        return quantities
    } catch (e) {
        return e
    }
}

module.exports = {
    add_product,
    write_database,
    read_product,
    read_all_products
}