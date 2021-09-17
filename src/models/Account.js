const mongoose = require ("mongoose");

const AccountSchema = new mongoose.Schema
(
    {
        name: String,
        email: String,
        password: String,
        connectionOptions:
        {
            brokerHost: String,
            accessCheckTopic: String,
            accessReplyTopic: String,
            statusUpdateTopic: String,
            directCommandTopic: String
        }
    }
);

module.exports = mongoose.model ("Account", AccountSchema);