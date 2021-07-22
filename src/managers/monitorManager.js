const io = require ("./websocketManager");
const Account = require ("../models/Account");
const User = require ("../models/User");
const Group = require ("../models/Group");
const Lock = require ("../models/Lock");
const Role = require ("../models/Role");
const Time = require ("../models/Time");
const Log = require ("../models/Log");

var accountRelations = [];

async function addToMonitors ()
{
    var accounts = await Account.find ().lean ();
    for (var a = 0; a < accounts.length; a++)
    {
        var timeRelations = [];
        var times = await Time.find ({owner: accounts[a]._id}).lean ();
        for (var b = 0; b < times.length; b++)
        {
            var accessRelations = [];
            var users = await User.find ({usedTimes: times[b]._id}).lean ();
            var groups = await Group.find ({usedTimes: times[b]._id}).lean ();
            var groupIds = [];
            groups.map
            (
                (group) =>
                {
                    groupIds.push (group._id);
                }
            );
            var locks = await Lock.find ({parents: {$in: groupIds}}).lean ();
            users.map
            (
                (user) =>
                {
                    locks.map
                    (
                        (lock) =>
                        {
                            accessRelations.push
                            (
                                {
                                    userId: user._id,
                                    lockId: lock._id,
                                    access: false
                                }
                            );
                        }
                    );
                }
            );
            timeRelations.push
            (
                {
                    timeId: times[b]._id,
                    accessRelations
                }
            );
        }
        accountRelations.push
        (
            {
                accountId: accounts[a]._id,
                timeRelations
            }
        );
    }
}

function addToMonitorsByAccount (accountId)
{
    accountRelations.push
    (
        {
            accountId,
            timeRelations: []
        }
    );
}

async function addToMonitorsByRole (roleId)
{
    var role = await Role.findById (roleId).populate ("times").lean ();
    var times = role.times;
    var newTimeRelations = [];
    if (times.length === 0)
    {
        return;
    }
    for (var a = 0; a < times.length; a++)
    {
        var accessRelations = [];
        var users = await User.find ({usedTimes: times[a]._id}).lean ();
        var groups = await Group.find ({usedTimes: times[a]._id}).lean ();
        var groupIds = [];
        groups.map
        (
            (group) =>
            {
                groupIds.push (group._id);
            }
        );
        var locks = await Lock.find ({parents: {$in: groupIds}}).lean ();
        users.map
        (
            (user) =>
            {
                locks.map
                (
                    (lock) =>
                    {
                        accessRelations.push
                        (
                            {
                                userId: user._id,
                                lockId: lock._id,
                                access: false
                            }
                        );
                    }
                );
            }
        );
        newTimeRelations.push
        (
            {
                timeId: times[a]._id,
                accessRelations
            }
        );
    }
    for (var b = 0; b < accountRelations.length; b++)
    {
        if (accountRelations[b].accountId.toString () === role.owner.toString ())
        {
            accountRelations[b].timeRelations = [...accountRelations[b].timeRelations, ...newTimeRelations];
            b = accountRelations.length;
        }
    }
}

async function addToMonitorsByUser (userId)
{
    var newTimeRelations = [];
    var user = await User.findById (userId).lean ();
    var times = await Time.find ({_id: {$in: user.usedTimes}}).lean ();
    for (var a = 0; a < times.length; a++)
    {
        var accessRelations = [];
        var groups = await Group.find ({usedTimes: times[a]._id}).lean ();
        var groupIds = [];
        groups.map
        (
            (group) =>
            {
                groupIds.push (group._id);
            }
        );
        var locks = await Lock.find ({parents: {$in: groupIds}}).lean ();
        locks.map
        (
            (lock) =>
            {
                accessRelations.push
                (
                    {
                        userId: user._id,
                        lockId: lock._id,
                        access: false
                    }
                );
            }
        );
        newTimeRelations.push
        (
            {
                timeId: times[a]._id,
                accessRelations
            }
        );
    }
    for (var b = 0; b < accountRelations.length; b++)
    {
        if (accountRelations[b].accountId.toString () === user.owner.toString ())
        {
            accountRelations[b].timeRelations.map
            (
                (timeRelation, index) =>
                {
                    newTimeRelations.map
                    (
                        (newTimeRelation, otherIndex) =>
                        {
                            if (timeRelation.timeId.toString () === newTimeRelation.timeId.toString ())
                            {
                                accountRelations[b].timeRelations[index].accessRelations =
                                [
                                    ...accountRelations[b].timeRelations[index].accessRelations,
                                    ...newTimeRelation.accessRelations
                                ];
                            }
                        }
                    );
                }
            );
            b = accountRelations.length;
        }
    }
}

async function addToMonitorsByGroup (groupId)
{
    var newTimeRelations = [];
    var group = await Group.findById (groupId).lean ();
    var locks = await Lock.find ({parents: group._id}).lean ();
    for (var a = 0; a < locks.length; a++)
    {
        var timeIds = [];
        var groups = await Group.find ({_id: {$in: locks[a].parents}}).lean ();
        groups.map
        (
            (group) =>
            {
                group.usedTimes.map
                (
                    (usedTime) =>
                    {
                        if (timeIds.includes (usedTime) === false)
                        {
                            timeIds.push (usedTime);
                        }
                    }
                );
            }
        );
        for (var b = 0; b < timeIds.length; b++)
        {
            var accessRelations = [];
            var users = await User.find ({usedTimes: timeIds[b]}).lean ();
            users.map
            (
                (user) =>
                {
                    accessRelations.push
                    (
                        {
                            userId: user._id,
                            lockId: locks[a]._id,
                            access: false
                        }
                    );
                }
            );
            newTimeRelations.push
            (
                {
                    timeId: timeIds[b],
                    accessRelations
                }
            );
        }
    }
    for (var c = 0; c < accountRelations.length; c++)
    {
        if (accountRelations[c].accountId.toString () === group.owner.toString ())
        {
            accountRelations[c].timeRelations.map
            (
                (timeRelation, index) =>
                {
                    newTimeRelations.map
                    (
                        (newTimeRelation, otherIndex) =>
                        {
                            if (timeRelation.timeId.toString () === newTimeRelation.timeId.toString ())
                            {
                                accountRelations[c].timeRelations[index].accessRelations =
                                [
                                    ...accountRelations[c].timeRelations[index].accessRelations,
                                    ...newTimeRelation.accessRelations
                                ];
                            }
                        }
                    );
                }
            );
            c = accountRelations.length;
        }
    }
}

async function addToMonitorsByLock (lockId)
{
    var newTimeRelations = [];
    var lock = await Lock.findById (lockId).lean ();
    var groups = await Group.find ({_id: {$in: lock.parents}}).lean ();
    var timeIds = [];
    groups.map
    (
        (group) =>
        {
            group.usedTimes.map
            (
                (usedTime) =>
                {
                    if (timeIds.includes (usedTime) === false)
                    {
                        timeIds.push (usedTime);
                    }
                }
            );
        }
    );
    for (var a = 0; a < timeIds.length; a++)
    {
        var accessRelations = [];
        var users = await User.find ({usedTimes: timeIds[a]}).lean ();
        users.map
        (
            (user) =>
            {
                accessRelations.push
                (
                    {
                        userId: user._id,
                        lockId: locks[a]._id,
                        access: false
                    }
                );
            }
        );
        newTimeRelations.push
        (
            {
                timeId: timeIds[a],
                accessRelations
            }
        );
    }
    for (var b = 0; b < accountRelations.length; b++)
    {
        if (accountRelations[b].accountId.toString () === lock.owner.toString ())
        {
            accountRelations[b].timeRelations.map
            (
                (timeRelation, index) =>
                {
                    newTimeRelations.map
                    (
                        (newTimeRelation, otherIndex) =>
                        {
                            if (timeRelation.timeId.toString () === newTimeRelation.timeId.toString ())
                            {
                                accountRelations[b].timeRelations[index].accessRelations =
                                [
                                    ...accountRelations[b].timeRelations[index].accessRelations,
                                    ...newTimeRelation.accessRelations
                                ];
                            }
                        }
                    );
                }
            );
            b = accountRelations.length;
        }
    }
}

function removeFromMonitorsByAccount (accountId)
{
    for (var a = 0; a < accountRelations.length; a++)
    {
        if (accountRelations[a].accountId.toString () === accountId.toString ())
        {
            accountRelations.splice (a, 1);
            a = accountRelations.length;
        }
    }
}

async function removeFromMonitorsByRole (roleId)
{
    var role = await Role.findById (roleId).populate ("times").lean ();
    var times = role.times;
    if (times.length === 0)
    {
        return;
    }
    for (var a = 0; a < accountRelations.length; a++)
    {
        if (accountRelations[a].accountId.toString () === role.owner.toString ())
        {
            for (var b = 0; b < accountRelations[a].timeRelations.length; b++)
            {
                times.map
                (
                    (time) =>
                    {
                        if (accountRelations[a].timeRelations[b].timeId.toString () === time._id.toString ())
                        {
                            accountRelations[a].timeRelations.splice (b, 1);
                            b--;
                        }
                    }
                );                
            }
            a = accountRelations.length;
        }
    }
}

async function removeFromMonitorsByUser (userId)
{
    var user = await User.findById (userId).lean ();
    for (var a = 0; a < accountRelations.length; a++)
    {
        if (accountRelations[a].accountId.toString () === user.owner.toString ())
        {
            accountRelations[a].timeRelations.map
            (
                (timeRelation) =>
                {
                    for (var b = 0; b < timeRelation.accessRelations.length; b++)
                    {
                        if (timeRelation.accessRelations[b].userId.toString () === user._id.toString ())
                        {
                            timeRelation.accessRelations.splice (b, 1);
                            b--;
                        }
                    }
                }
            );
            a = accountRelations.length;
        }
    }
}

async function removeFromMonitorsByGroup (groupId)
{
    var group = await Group.findById (groupId).lean ();
    var locks = await Lock.find ({parents: group._id}).lean ();
    var lockIds = [];
    locks.map
    (
        (lock) =>
        {
            lockIds.push (lock._id);
        }
    );
    for (var a = 0; a < accountRelations.length; a++)
    {
        if (accountRelations[a].accountId.toString () === group.owner.toString ())
        {
            accountRelations[a].timeRelations.map
            (
                (timeRelation) =>
                {
                    for (var b = 0; b < timeRelation.accessRelations.length; b++)
                    {
                        if (lockIds.includes (timeRelation.accessRelations[b].lockId))
                        {
                            timeRelation.accessRelations.splice (b, 1);
                            b--;
                        }
                    }
                }
            );
            a = accountRelations.length;
        }
    }
}

async function removeFromMonitorsByLock (lockId)
{
    var lock = await Lock.findById (lockId).lean ();
    for (var a = 0; a < accountRelations.length; a++)
    {
        if (accountRelations[a].accountId.toString () === lock.owner.toString ())
        {
            accountRelations[a].timeRelations.map
            (
                (timeRelation) =>
                {
                    for (var b = 0; b < timeRelation.accessRelations.length; b++)
                    {
                        if (timeRelation.accessRelations[b].lockId.toString () === lock._id.toString ())
                        {
                            timeRelation.accessRelations.splice (b, 1);
                            b--;
                        }
                    }
                }
            );
            a = accountRelations.length;
        }
    }
}

async function checkMonitors (owner, timeId)
{
    for (var a = 0; a < accountRelations.length; a++)
    {
        if (accountRelations[a].accountId.toString () === owner.toString ())
        {
            for (var b = 0; b < accountRelations[a].timeRelations.length; b++)
            {
                if (accountRelations[a].timeRelations[b].timeId.toString () === timeId.toString ())
                {
                    for (var c = 0; c < accountRelations[a].timeRelations[b].accessRelations.length; c++)
                    {
                        if (accountRelations[a].timeRelations[b].accessRelations[c].access === false)
                        {
                            var localDate = new Date ();
                            var offset = localDate.getTimezoneOffset ();
                            var minutes = localDate.getMinutes ();
                            localDate.setMinutes (minutes-offset);
                            var role = await Role.findOne ({times: timeId}).lean ();
                            var user = await User.findById (accountRelations[a].timeRelations[b].accessRelations[c].userId).lean ();
                            var lock = await Lock.findById (accountRelations[a].timeRelations[b].accessRelations[c].lockId).lean ();
                            var groups = await Group.find ({_id: {$in: lock.parents}}).lean ();
                            var pathNames = [];
                            groups.map
                            (
                                (group) =>
                                {
                                    pathNames.push (group.name);
                                }
                            );
                            pathNames.push (lock.name);
                            // var log = await Log.create
                            await Log.create
                            (
                                {
                                    user: user.name,
                                    lock: lock.name,
                                    path: pathNames,
                                    role: role.name,
                                    type: "Miss",
                                    creationDate: localDate,
                                    owner: user.owner
                                }
                            );
                            // io.emit ("log", log);
                        }
                    }
                }
            }
            a = accountRelations.length;
        }
    }
}

function accessMonitors (owner, timeIds, userId, lockId)
{
    for (var a = 0; a < accountRelations.length; a++)
    {
        if (accountRelations[a].accountId.toString () === owner.toString ())
        {
            accountRelations[a].timeRelations.map
            (
                (timeRelation) =>
                {
                    for (var b = 0; b < timeIds.length; b++) {timeIds[b] = timeIds[b].toString ()}
                    if (timeIds.includes (timeRelation.timeId.toString ()))
                    {
                        timeRelation.accessRelations.map
                        (
                            (accessRelation) =>
                            {
                                if (accessRelation.userId.toString () === userId.toString () && accessRelation.lockId.toString () === lockId.toString ())
                                {
                                    accessRelation.access = true;
                                }
                            }
                        );
                    }
                }
            );
            a = accountRelations.length;
        }
    }
}

module.exports =
{
    addToMonitors,
    addToMonitorsByAccount,
    addToMonitorsByRole,
    addToMonitorsByUser,
    addToMonitorsByGroup,
    addToMonitorsByLock,
    removeFromMonitorsByAccount,
    removeFromMonitorsByRole,
    removeFromMonitorsByUser,
    removeFromMonitorsByGroup,
    removeFromMonitorsByLock,
    checkMonitors,
    accessMonitors
};