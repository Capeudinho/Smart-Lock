const mqtt = require ("async-mqtt");
const {accessCheck} = require ("./accessManager");
const {statusUpdate} = require ("./statusManager");
const Account = require ("../models/Account");
const Lock = require ("../models/Lock");

var brokerRelations = [];

async function addToMqtt ()
{
    var accounts = await Account.find ().lean ();
    for (var a = 0; a < accounts.length; a++)
    {
        var usedBroker = false;
        for (var b = 0; b < brokerRelations.length; b++)
        {
            if (brokerRelations[b].broker === accounts[a].connectionOptions.brokerHost)
            {
                usedBroker = true;
                brokerRelations[b].uses = brokerRelations[b].uses+1;
                var usedAccessCheckTopic = false;
                var usedStatusUpdateTopic = false;
                for (var c = 0; c < brokerRelations[b].topicRelations.length; c++)
                {
                    if (brokerRelations[b].topicRelations[c].topic === accounts[a].connectionOptions.accessCheckTopic)
                    {
                        usedAccessCheckTopic = true;
                        brokerRelations[b].topicRelations[c].uses = brokerRelations[b].topicRelations[c].uses+1;
                    }
                    if (brokerRelations[b].topicRelations[c].topic === accounts[a].connectionOptions.statusUpdateTopic)
                    {
                        usedStatusUpdateTopic = true;
                        brokerRelations[b].topicRelations[c].uses = brokerRelations[b].topicRelations[c].uses+1;
                    }
                }
                if (usedAccessCheckTopic === false)
                {
                    await brokerRelations[b].client.subscribe (accounts[a].connectionOptions.accessCheckTopic);
                    brokerRelations[b].topicRelations.push
                    (
                        {
                            topic: accounts[a].connectionOptions.accessCheckTopic,
                            uses: 1
                        }
                    );
                }
                if (usedStatusUpdateTopic === false)
                {
                    await brokerRelations[b].client.subscribe (accounts[a].connectionOptions.statusUpdateTopic);
                    brokerRelations[b].topicRelations.push
                    (
                        {
                            topic: accounts[a].connectionOptions.statusUpdateTopic,
                            uses: 1
                        }
                    );
                }
            }
        }
        if (usedBroker === false)
        {
            var client = await mqtt.connectAsync (accounts[a].connectionOptions.brokerHost);
            await client.subscribe (accounts[a].connectionOptions.accessCheckTopic);
            await client.subscribe (accounts[a].connectionOptions.statusUpdateTopic);
            client.on ("message", async (topic, message) => {await handleMessage (client, topic, message)});
            brokerRelations.push
            (
                {
                    broker: accounts[a].connectionOptions.brokerHost,
                    uses: 1,
                    client,
                    topicRelations:
                    [
                        {
                            topic: accounts[a].connectionOptions.accessCheckTopic,
                            uses: 1
                        },
                        {
                            topic: accounts[a].connectionOptions.statusUpdateTopic,
                            uses: 1
                        }
                    ]
                }
            );
        }
    }
}

async function addToMqttByAccount (accountId)
{
    var account = await Account.findById (accountId).lean ();
    var usedBroker = false;
    for (var a = 0; a < brokerRelations.length; a++)
    {
        if (brokerRelations[a].broker === account.connectionOptions.brokerHost)
        {
            usedBroker = true;
            brokerRelations[a].uses = brokerRelations[a].uses+1;
            var usedAccessCheckTopic = false;
            var usedStatusUpdateTopic = false;
            for (var b = 0; b < brokerRelations[a].topicRelations.length; b++)
            {
                if (brokerRelations[a].topicRelations[b].topic === account.connectionOptions.accessCheckTopic)
                {
                    usedAccessCheckTopic = true;
                    brokerRelations[a].topicRelations[b].uses = brokerRelations[a].topicRelations[b].uses+1;
                }
                if (brokerRelations[a].topicRelations[b].topic === account.connectionOptions.statusUpdateTopic)
                {
                    usedStatusUpdateTopic = true;
                    brokerRelations[a].topicRelations[b].uses = brokerRelations[a].topicRelations[b].uses+1;
                }
            }
            if (usedAccessCheckTopic === false)
            {
                await brokerRelations[a].client.subscribe (account.connectionOptions.accessCheckTopic);
                brokerRelations[a].topicRelations.push
                (
                    {
                        topic: account.connectionOptions.accessCheckTopic,
                        uses: 1
                    }
                );
            }
            if (usedStatusUpdateTopic === false)
            {
                await brokerRelations[a].client.subscribe (account.connectionOptions.statusUpdateTopic);
                brokerRelations[a].topicRelations.push
                (
                    {
                        topic: account.connectionOptions.statusUpdateTopic,
                        uses: 1
                    }
                );
            }
        }
    }
    if (usedBroker === false)
    {
        var client = await mqtt.connectAsync (account.connectionOptions.brokerHost);
        await client.subscribe (account.connectionOptions.accessCheckTopic);
        await client.subscribe (account.connectionOptions.statusUpdateTopic);
        client.on ("message", async (topic, message) => {await handleMessage (client, topic, message)});
        brokerRelations.push
        (
            {
                broker: account.connectionOptions.brokerHost,
                uses: 1,
                client,
                topicRelations:
                [
                    {
                        topic: account.connectionOptions.accessCheckTopic,
                        uses: 1
                    },
                    {
                        topic: account.connectionOptions.statusUpdateTopic,
                        uses: 1
                    }
                ]
            }
        );
    }
}

async function removeFromMqttByAccount (accountId)
{
    var account = await Account.findById (accountId).lean ();
    for (var b = 0; b < brokerRelations.length; b++)
    {
        if (brokerRelations[b].broker === account.connectionOptions.brokerHost)
        {
            brokerRelations[b].uses = brokerRelations[b].uses-1;
            for (var c = 0; c < brokerRelations[b].topicRelations.length; c++)
            {
                if (brokerRelations[b].topicRelations[c].topic === account.connectionOptions.accessCheckTopic)
                {
                    brokerRelations[b].topicRelations[c].uses = brokerRelations[b].topicRelations[c].uses-1;
                }
                if (brokerRelations[b].topicRelations[c].topic === account.connectionOptions.statusUpdateTopic)
                {
                    brokerRelations[b].topicRelations[c].uses = brokerRelations[b].topicRelations[c].uses-1;
                }
            }
        }
    }
}

async function removeFromMqttByUnused ()
{
    for (var a = 0; a < brokerRelations.length; a++)
    {
        if (brokerRelations[a].uses === 0)
        {
            await brokerRelations[a].client.end ();
            brokerRelations.splice (a, 1);
            a--;
        }
        else
        {
            for (var b = 0; b < brokerRelations[a].topicRelations.length; b++)
            {
                if (brokerRelations[a].topicRelations[b].uses === 0)
                {
                    await brokerRelations[a].client.unsubscribe (brokerRelations[a].topicRelations[b].topic);
                    brokerRelations[a].topicRelations.splice (b, 1);
                    b--;
                }
            }
        }
    }
}

async function testBrokerHost (brokerHost)
{
    try
    {
        var client = await mqtt.connectAsync (brokerHost);
    }
    catch (error)
    {
        return false;
    }
    await client.end ();
    return true;
}

async function openMqttLockById (lockId)
{
    var lock = await Lock.findById (lockId).lean ();
    var lockPIN = lock.PIN;
    var account = await Account.findById (lock.owner).lean ();
    for (var a = 0; a < brokerRelations.length; a++)
    {
        if (brokerRelations[a].broker === account.connectionOptions.brokerHost)
        {
            await brokerRelations[a].client.publish
            (
                account.connectionOptions.directCommandTopic+"/"+lockPIN,
                JSON.stringify ({command: "open"})
            );
            a = brokerRelations.length;
        }
    }
}

async function handleMessage (client, topic, message)
{
    try
    {
        message = JSON.parse (message.toString ());
        if
        (
            typeof message === "object" &&
            !Array.isArray (message) &&
            message !== null &&
            message.hasOwnProperty ("lockPIN") &&
            message.hasOwnProperty ("identifier") &&
            typeof message.lockPIN === "string" &&
            typeof message.identifier === "string"
        )
        {
            var {lockPIN, identifier} = message;
            var account = await Account.findOne ({"connectionOptions.identifier": identifier}).lean ();
            var lock = await Lock.findOne ({PIN: lockPIN, owner: account._id}).lean ();
            if (lock !== null)
            {
                if (topic === account.connectionOptions.accessCheckTopic)
                {
                    if
                    (
                        message.hasOwnProperty ("userPIN") &&
                        typeof message.userPIN === "string"
                    )
                    {
                        var {userPIN} = message;
                        var reply = await accessCheck (lockPIN, userPIN, identifier);
                        if (reply)
                        {
                            await client.publish
                            (
                                account.connectionOptions.accessReplyTopic+"/"+lockPIN,
                                JSON.stringify ({command: "open"})
                            );
                        }
                        else
                        {
                            await client.publish
                            (
                                account.connectionOptions.accessReplyTopic+"/"+lockPIN,
                                JSON.stringify ({command: "close"})
                            );
                        }
                    }
                }
                else if (topic === account.connectionOptions.statusUpdateTopic)
                {
                    if
                    (
                        message.hasOwnProperty ("lockStatus") &&
                        typeof message.lockStatus === "object" &&
                        !Array.isArray (message.lockStatus) &&
                        message.lockStatus !== null
                    )
                    {
                        var {lockStatus} = message;
                        await statusUpdate (lockPIN, lockStatus, identifier);
                    }
                }
            }
        }
    }
    catch (error)
    {
        return;
    }
}

module.exports =
{
    addToMqtt,
    addToMqttByAccount,
    removeFromMqttByAccount,
    removeFromMqttByUnused,
    testBrokerHost,
    openMqttLockById
};