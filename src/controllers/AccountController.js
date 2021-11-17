const Account = require ("../models/Account");
const User = require ("../models/User");
const Group = require ("../models/Group");
const Lock = require ("../models/Lock");
const Role = require ("../models/Role");
const Time = require ("../models/Time");
const Log = require ("../models/Log");
const {addToMonitorsByAccount, removeFromMonitorsByAccount} = require ("../managers/monitorManager");
const {addToMqttByAccount, removeFromMqttByAccount, removeFromMqttByUnused, testBrokerHost} = require ("../managers/mqttManager");
const {addToHttpByAccount, addToHttpByRoutes, removeFromHttpByAccount} = require ("../managers/httpManager");

module.exports =
{
    async list (request, response)
    {
        const accounts = await Account.find ().lean ();
        return response.json (accounts);
    },
    
    async idindex (request, response)
    {
        const {_id} = request.query;
        const account = await Account.findById (_id).lean ();
        return response.json (account);
    },

    async loginindex (request, response)
    {
        const {email, password} = request.query;
        const account = await Account.findOne ({email, password}).lean ();
        return response.json (account);
    },

    async store (request, response)
    {
        const {name, email, password} = request.body;
        const account = await Account.findOne ({email});
        var newAccount = null;
        if (account === null)
        {
            var identifier = "";
            var invalid = true;
            while (invalid)
            {
                identifier = Math.random ().toString ().substring (2);
                const otherAccount = await Account.findOne ({identifier});
                if (otherAccount === null)
                {
                    invalid = false;
                }
            }
            newAccount = await Account.create
            (
                {
                    name,
                    email,
                    password,
                    connectionOptions:
                    {
                        identifier,
                        brokerHost: "mqtt://broker.hivemq.com",
                        accessCheckTopic: "smartlock/accesscheck",
                        accessReplyTopic: "smartlock/accessreply",
                        statusUpdateTopic: "smartlock/statusupdate",
                        directCommandTopic: "smartlock/directcommand",
                        accessCheckRoute: "smartlock/accesscheck",
                        accessReplyRoute: "smartlock/accessreply",
                        statusUpdateRoute: "smartlock/statusupdate",
                        directCommandRoute: "smartlock/directcommand"
                    }
                }
            );
            await Group.create ({name: "Root", parents: [], roles: [], usedTimes: [], owner: newAccount._id});
            addToMonitorsByAccount (newAccount._id);
            await addToHttpByAccount (newAccount._id);
            addToHttpByRoutes ();
            await addToMqttByAccount (newAccount._id);
        }
        return response.json (newAccount);
    },

    async idupdate (request, response)
    {
        const {_id} = request.query;
        const {name, email, password} = request.body;
        const account = await Account.findOne ({email});
        var newAccount = null;
        if (account === null || account._id == _id)
        {
            newAccount = await Account.findByIdAndUpdate (_id, {name, email, password}, {new: true});
        }
        return response.json (newAccount);
    },

    async connectionoptionsidupdate (request, response)
    {
        const {_id} = request.query;
        const {connectionOptions} = request.body;
        if (await testBrokerHost (connectionOptions.brokerHost))
        {
            await removeFromHttpByAccount (_id);
            await removeFromMqttByAccount (_id);
            var newAccount = await Account.findByIdAndUpdate (_id, {connectionOptions}, {new: true});
            await addToHttpByAccount (_id);
            addToHttpByRoutes ();
            await addToMqttByAccount (_id);
            await removeFromMqttByUnused ();
            return response.json (newAccount);
        }
        else
        {
            return response.json (null);
        }
    },

    async iddestroy (request, response)
    {
        const {_id} = request.query;
        await removeFromHttpByAccount (_id);
        await removeFromMqttByAccount (_id);
        addToHttpByRoutes ();
        await removeFromMqttByUnused ();
        removeFromMonitorsByAccount (_id);
        const account = await Account.findByIdAndDelete (_id);
        await User.deleteMany ({owner: _id});
        await Group.deleteMany ({owner: _id});
        await Lock.deleteMany ({owner: _id});
        await Role.deleteMany ({owner: _id});
        await Time.deleteMany ({owner: _id});
        await Log.deleteMany ({owner: _id});
        return response.json (account);
    }
};