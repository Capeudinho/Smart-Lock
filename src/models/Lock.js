const mongoose = require ("mongoose");
const Item = require ("./Item");

const LockSchema = new mongoose.Schema
(
    {

    }
);

module.exports = Item.discriminator ("Lock", LockSchema);