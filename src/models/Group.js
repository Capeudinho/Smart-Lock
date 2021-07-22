const mongoose = require ("mongoose");
const Item = require ("./Item");

const GroupSchema = new mongoose.Schema
(
    {
        roles: [String],
        usedTimes: [String]
    }
);

module.exports = Item.discriminator ("Group", GroupSchema);