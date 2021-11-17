const mongoose = require ("mongoose");

const AccountSchema = new mongoose.Schema
(
    {
        name: String,
        email: String,
        password: String,
        connectionOptions:
        {
            identifier: String,
            brokerHost: String,
            accessCheckTopic: String,
            accessReplyTopic: String,
            statusUpdateTopic: String,
            directCommandTopic: String,
            accessCheckRoute: String,
            accessReplyRoute: String,
            statusUpdateRoute: String,
            directCommandRoute: String
        }
    }
);

module.exports = mongoose.model ("Account", AccountSchema);