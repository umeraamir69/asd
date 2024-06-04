const mongoose = require ('mongoose');

const { MongoMemoryServer } =  require('mongodb-memory-server');


async function connect(){

    const mongod = await MongoMemoryServer.create();
    const getUri = mongod.getUri();

    mongoose.set('strictQuery', true)
    // const db = await mongoose.connect(getUri);
    const db = await mongoose.connect("mongodb+srv://f200203:usama0203@cluster0.yde86m1.mongodb.net/apparelplm?w=majority");
    console.log("Database Connected")
    return db;
}

module.exports = connect;
