const {accessMonitors} = require ("./monitorManager");
const Account = require ("../models/Account");
const User = require ("../models/User");
const Group = require ("../models/Group");
const Lock = require ("../models/Lock");
const Role = require ("../models/Role");
const Time = require ("../models/Time");
const Log = require ("../models/Log");

async function accessCheck (lockPIN, userPIN, identifier)
{
    var account = await Account.findOne ({"connectionOptions.identifier": identifier});
    if (account === null)
    {
        return (false);
    }
    var lock = await Lock.findOne ({PIN: lockPIN, owner: account._id}).lean ();
    var user = await User.findOne ({PINs: userPIN, owner: account._id}).lean ();
    if (lock === null || user === null)
    {
        return (false);
    }
    var allowAccess = false;
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
    if (allowAccess)
    {
        for (var a = 0; a < appliedTimes.length; a++)
        {
            if (appliedTimes[a].trackAccess)
            {
                var localDate = new Date ();
                var offset = localDate.getTimezoneOffset ();
                var minutes = localDate.getMinutes ();
                localDate.setMinutes (minutes-offset);
                var role = await Role.findOne ({times: appliedTimes[a]._id}).lean ();
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
            }
        }
        accessMonitors (user.owner, appliedTimeIds, user._id, lock._id);
        return (true);
    }
    else
    {
        return (false);
    }
}

module.exports = {accessCheck};