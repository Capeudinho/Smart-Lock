const mongoose = require ("mongoose");
const Item = require ("./Item");

const LockSchema = new mongoose.Schema
(
    {
        PIN: String,
        protocol: String,
        host: String,
        port: String
    }
);

module.exports = Item.discriminator ("Lock", LockSchema);