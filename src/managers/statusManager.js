const Account = require ("../models/Account");
const Group = require ("../models/Group");
const Lock = require ("../models/Lock");

var accountRelations = [];

async function addToStatus ()
{
    var accounts = await Account.find ().lean ();
    for (var a = 0; a < accounts.length; a++)
    {
        var statusRelations = [];
        var locks = await Lock.find ({owner: accounts[a]._id}).lean ();
        locks.map
        (
            (lock) =>
            {
                statusRelations.push
                (
                    {
                        lockId: lock._id,
                        status: {}
                    }
                );
            }
        );
        accountRelations.push
        (
            {
                accountId: accounts[a]._id,
                statusRelations
            }
        );
    }
}

function addToStatusByAccount (accountId)
{
    accountRelations.push
    (
        {
            accountId,
            statusRelations: []
        }
    );
}

async function addToStatusByLock (lockId)
{
    var lock = await Lock.findById (lockId).lean ();
    for (var a = 0; a < accountRelations.length; a++)
    {
        if (accountRelations[a].accountId.toString () === lock.owner.toString ())
        {
            accountRelations[a].statusRelations.push
            (
                {
                    lockId: lock._id,
                    status: {}
                }
            );
            a = accountRelations.length;
        }
    }
}

async function removeFromStatusByGroup (groupId)
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
            for (var b = 0; b < accountRelations[a].statusRelations.length; b++)
            {
                if (lockIds.includes (accountRelations[a].statusRelations[b].lockId.toString ()))
                {
                    accountRelations[a].statusRelations.splice (b, 1);
                    b--;
                }
            }
            a = accountRelations.length;
        }
    }
}

function removeFromStatusByAccount (accountId)
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

async function removeFromStatusByLock (lockId)
{
    var lock = await Lock.findById (lockId).lean ();
    for (var a = 0; a < accountRelations.length; a++)
    {
        if (accountRelations[a].accountId.toString () === lock.owner.toString ())
        {
            for (var b = 0; b < accountRelations[a].statusRelations.length; b++)
            {
                if (accountRelations[a].statusRelations[b].lockId.toString () === lockId.toString ())
                {
                    accountRelations[a].statusRelations.splice (b, 1);
                    b = accountRelations[a].statusRelations.length;
                }
            }
            a = accountRelations.length;
        }
    }
}

async function getStatusByLock (lockId)
{
    var lock = await Lock.findById (lockId).lean ();
    for (var a = 0; a < accountRelations.length; a++)
    {
        if (accountRelations[a].accountId.toString () === lock.owner.toString ())
        {
            for (var b = 0; b < accountRelations[a].statusRelations.length; b++)
            {
                if (accountRelations[a].statusRelations[b].lockId.toString () === lockId.toString ())
                {
                    var status = accountRelations[a].statusRelations[b].status;
                    return (status);
                }
            }
        }
    }
}

async function statusUpdate (lockPIN, lockStatus, identifier)
{
    var account = await Account.findOne ({"connectionOptions.identifier": identifier});
    if (account === null)
    {
        return;
    }
    var lock = await Lock.findOne ({PIN: lockPIN, owner: account._id}).lean ();
    if (lock === null)
    {
        return;
    }
    for (var a = 0; a < accountRelations.length; a++)
    {
        if (accountRelations[a].accountId.toString () === lock.owner.toString ())
        {
            for (var b = 0; b < accountRelations[a].statusRelations.length; b++)
            {
                if (accountRelations[a].statusRelations[b].lockId.toString () === lock._id.toString ())
                {
                    accountRelations[a].statusRelations[b].status = lockStatus;
                }
            }
        }
    }
}

module.exports =
{
    addToStatus,
    addToStatusByAccount,
    addToStatusByLock,
    removeFromStatusByAccount,
    removeFromStatusByGroup,
    removeFromStatusByLock,
    getStatusByLock,
    statusUpdate
};