
const {MongoClient} = require("mongodb");
const {splitPath} = require("./PathManager");
const mongoUri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(mongoUri);
const database = client.db('elect_dig');
const messageCollection = database.collection('vending_machine');

async function write_database(topic, message){
    const product = splitPath(topic, -1)
    console.log(product)
    console.log(message.toString())
    await messageCollection.findOneAndUpdate(
        {title: product},
        {$inc: {qty: parseInt(message.toString())}}
    )
    console.log("Compra exitosa")
}

async function add_product(topic, message) {
    const product = message.toString().split(",");
    await messageCollection.insertOne(
        {
            title : product[0],
            qty : parseInt(product[1])
        }
    )
    console.log("Agregado con exito!")
}

async function read_product(topic) {
    const product = splitPath(topic, -1)
    const result = await messageCollection.findOne(
        {title: product}
    )
    console.log(result)
}

async function read_all_products() {
    const result = await messageCollection.find().toArray()
    const quantities = []
    result.forEach(element => {
        quantities.push({
            title: element.title,
            qty: element.qty
        })
    });
    return quantities;
}

module.exports = {
    add_product,
    write_database,
    read_product,
    read_all_products
}