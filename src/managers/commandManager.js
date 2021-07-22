const mqtt = require ("mqtt");

const client = mqtt.connect ("mqtt://broker.hivemq.com");

function open (lockId, time)
{
    client.publish
    (
        "commandOpen",
        lockId+" "+time
    );
}

module.exports = {open};