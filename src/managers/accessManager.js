const mqtt = require ("mqtt");
const io = require ("./websocketManager");
const {accessMonitors} = require ("./monitorManager");
const User = require ("../models/User");
const Group = require ("../models/Group");
const Lock = require ("../models/Lock");
const Role = require ("../models/Role");
const Time = require ("../models/Time");
const Log = require ("../models/Log");

const client = mqtt.connect ("mqtt://broker.hivemq.com");

client.on
(
    "connect",
    () =>
    {
        client.subscribe
        (
            "checkAccess",
            (error) => {}
        );
    }
);

client.on
(
    "message",
    async (topic, message) =>
    {
        var allowAccess = false;
        if (topic === "checkAccess")
        {
            message = JSON.parse (message);
            var _id = message._id;
            var PIN = message.PIN;
            var lock = await Lock.findById (_id).lean ();
            var user = await User.findOne ({PINs: PIN, owner: lock.owner}).lean ();
            if (user !== null && lock !== null)
            {
                var pathNames = [];
                var timeIds = [];
                var groups = await Group.find ({_id: {$in: lock.parents}}).lean ();
                groups.map
                (
                    (group) =>
                    {
                        pathNames.push (group.name);
                        group.usedTimes.map
                        (
                            (usedTime) =>
                            {
                                if (user.usedTimes.includes (usedTime) && timeIds.includes (usedTime) === false)
                                {
                                    timeIds.push (usedTime);
                                }
                            }
                        );
                    }
                );
                pathNames.push (lock.name);
                if (timeIds.length > 0)
                {
                    var currentTime = new Date;
                    currentTime =
                    {
                        hour: (currentTime.getHours ()*60)+currentTime.getMinutes (),
                        day: currentTime.getDay ()
                    };
                    var appliedTimes = [];
                    var appliedTimeIds = [];
                    var times = await Time.find ({_id: {$in: timeIds}}).lean ();
                    times.map
                    (
                        (time) =>
                        {
                            if (time.start < time.end)
                            {
                                if (currentTime.hour >= time.start && currentTime.hour <= time.end && time.days [currentTime.day] === true)
                                {
                                    allowAccess = true;
                                    appliedTimes.push (time);
                                    appliedTimeIds.push (time._id);
                                }
                            }
                            else if (time.start > time.end)
                            {
                                if (currentTime.hour >= time.start && time.days [currentTime.day] === true || currentTime.hour <= time.end && time.days [currentTime.day] === true)
                                {
                                    allowAccess = true;
                                    appliedTimes.push (time);
                                    appliedTimeIds.push (time._id);
                                }
                            }
                        }
                    );
                }
            }
        }
        if (allowAccess)
        {
            client.publish
            (
                "respondAccess",
                _id+" true"
            );
            for (var a = 0; a < appliedTimes.length; a++)
            {
                if (appliedTimes[a].trackAccess)
                {
                    var localDate = new Date ();
                    var offset = localDate.getTimezoneOffset ();
                    var minutes = localDate.getMinutes ();
                    localDate.setMinutes (minutes-offset);
                    var role = await Role.findOne ({times: appliedTimes[a]._id}).lean ();
                    // var log = await Log.create
                    await Log.create
                    (
                        {
                            user: user.name,
                            lock: lock.name,
                            path: pathNames,
                            role: role.name,
                            type: "Access",
                            creationDate: localDate,
                            owner: user.owner
                        }
                    );
                    // io.emit ("log", log);
                }
            }
            accessMonitors (user.owner, appliedTimeIds, user._id, lock._id);
        }
        else
        {
            client.publish
            (
                "respondAccess",
                "false"
            );
        }
    }
);

module.exports = client;