const {openLockById} = require ("./mqttManager");

function commandOpen (lockId)
{
    openLockById (lockId);
}

module.exports = {commandOpen};