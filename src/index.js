const express = require ("express");
const cors = require ("cors");
const mongoose = require ("mongoose");
const routes = require ("./routes");
const {addToSchedules} = require ("./managers/scheduleManager");
const {addToMonitors} = require ("./managers/monitorManager");
const {addToStatus} = require ("./managers/statusManager");
const {addToMqtt} = require ("./managers/mqttManager");

const app = express ();

mongoose.connect
(
    "mongodb+srv://Capeudinho:kenjin202530@cluster0-yh3ut.mongodb.net/smart_lock?retryWrites=true&w=majority",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then
(
    async () =>
    {
        await addToMqtt ();
        await addToMonitors ();
        await addToSchedules ();
        await addToStatus ();
    }
);

app.use (cors ());
app.use (express.json ());
app.use (routes);

app.listen (3333);

module.exports = app;