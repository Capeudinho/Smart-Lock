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
            client.on
            (
                "message",
                async (topic, message) =>
                {
                    message = JSON.parse (message);
                    var lockId = message.lockId;
                    var lock = await Lock.findById (lockId).lean ();
                    var account = await Account.findById (lock.owner).lean ();
                    if (topic === account.connectionOptions.accessCheckTopic)
                    {
                        var reply = await accessCheck (lockId, message.userPIN);
                        if (reply)
                        {
                            client.publish
                            (
                                account.connectionOptions.accessReplyTopic+"/"+lockId,
                                "true"
                            );
                        }
                        else
                        {
                            client.publish
                            (
                                account.connectionOptions.accessReplyTopic+"/"+lockId,
                                "false"
                            );
                        }
                    }
                    else if (topic === account.connectionOptions.statusUpdateTopic)
                    {
                        await statusUpdate (lockId, message.lockState, message.lockPower);
                    }
                }
            );
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
        client.on
        (
            "message",
            async (topic, message) =>
            {
                message = JSON.parse (message);
                var lockId = message.lockId;
                var lock = await Lock.findById (lockId).lean ();
                var account = await Account.findById (lock.owner).lean ();
                if (topic === account.connectionOptions.accessCheckTopic)
                {
                    var reply = await accessCheck (lockId, message.userPIN);
                    if (reply)
                    {
                        client.publish
                        (
                            account.connectionOptions.accessReplyTopic+"/"+lockId,
                            "true"
                        );
                    }
                    else
                    {
                        client.publish
                        (
                            account.connectionOptions.accessReplyTopic+"/"+lockId,
                            "false"
                        );
                    }
                }
                else if (topic === account.connectionOptions.statusUpdateTopic)
                {
                    await statusUpdate (lockId, message.lockState, message.lockPower);
                }
            }
        );
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

async function openLockById (lockId)
{
    var lock = await Lock.findById (lockId).lean ();
    var account = await Account.findById (lock.owner).lean ();
    client.publish
    (
        account.connectionOptions.directCommandTopic+"/"+lockId,
        "open"
    );
}

module.exports =
{
    addToMqtt,
    addToMqttByAccount,
    removeFromMqttByAccount,
    removeFromMqttByUnused,
    testBrokerHost,
    openLockById
};