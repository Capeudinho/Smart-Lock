const express = require ("express");
const cors = require ("cors");
const mongoose = require ("mongoose");
const routes = require ("./routes");
const {addToSchedules} = require ("./managers/scheduleManager");
const {addToMonitors} = require ("./managers/monitorManager");
const {addToStatus} = require ("./managers/statusManager");
const {addToMqtt} = require ("./managers/mqttManager");
const {addToHttp, httpManagerRoutes} = require ("./managers/httpManager");
const connectionString = require ("./config/connectionString");

const app = express ();

(
    async () =>
    {
        try
        {
            await mongoose.connect
            (
                connectionString,
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                }
            );
            await addToHttp ();
            await addToMqtt ();
            await addToMonitors ();
            await addToSchedules ();
            await addToStatus ();
            console.log ("Server ready");
        }
        catch (e) {}
    }
)();

app.use (cors ());
app.use (express.json ());
app.use (routes);
app.use (httpManagerRoutes);
app.listen (3333);

module.exports = app;