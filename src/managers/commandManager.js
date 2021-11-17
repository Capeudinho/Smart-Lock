const {openMqttLockById} = require ("./mqttManager");
const {openHttpLockById} = require ("./httpManager");
const Lock = require ("../models/Lock");

async function commandOpen (lockId)
{
    var lock = await Lock.findById (lockId).lean ();
    if (lock.protocol === "mqtt")
    {
        await openMqttLockById (lockId);
    }
    else if (lock.protocol === "http")
    {
        await openHttpLockById (lockId);
    }
}

module.exports = {commandOpen};