const mongoose = require ("mongoose");

const AccountSchema = new mongoose.Schema
(
    {
        name: String,
        email: String,
        password: String
    }
);

module.exports = mongoose.model ("Account", AccountSchema);