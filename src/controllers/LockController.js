const Lock = require ("../models/Lock");
const Group = require ("../models/Group");
const Item = require ("../models/Item");
const {commandOpen} = require ("../managers/commandManager");
const {addToMonitorsByLock, removeFromMonitorsByLock} = require ("../managers/monitorManager");
const {addToStatusByLock, removeFromStatusByLock} = require ("../managers/statusManager");

module.exports =
{
    async list (request, response)
    {
        const locks = await Lock.find ().lean ();
        return response.json (locks);
    },
    
    async idindex (request, response)
    {
        const {_id} = request.query;
        const lock = await Lock.findById (_id).lean ();
        return response.json (lock);
    },

    async idopen (request, response)
    {
        const {_id} = request.query;
        await commandOpen (_id);
        return response.json (_id);
    },

    async store (request, response)
    {
        const {name, lastParent, protocol, host, port, owner} = request.body;
        const parent = await Item.findById (lastParent).lean ();
        var parents = parent.parents.concat (lastParent);
        var PIN = "";
        var invalid = true;
        while (invalid)
        {
            PIN = Math.random ().toString ().substring (2);
            const otherLock = await Lock.findOne ({PIN});
            if (otherLock === null)
            {
                invalid = false;
            }
        }
        var newLock = await Lock.create ({name, parents, PIN, protocol, host, port, owner});
        await addToMonitorsByLock (newLock._id);
        await addToStatusByLock (newLock._id);
        return response.json (newLock);
    },

    async idupdate (request, response)
    {
        const {_id} = request.query;
        const {name, PIN, protocol, host, port, owner} = request.body;
        const lock = await Lock.findOne ({PIN, owner});
        var newLock = null;
        if (lock === null  || lock._id == _id)
        {
            newLock = await Lock.findByIdAndUpdate (_id, {name, PIN, protocol, host, port, owner}, {new: true});
        }
        return response.json (newLock);
    },

    async idupdatemove (request, response)
    {
        const {_id, destination_id} = request.query;
        const lock = await Lock.findById (_id).lean ();
        var destination = await Group.findById (destination_id).lean ();
        if (lock.parents[lock.parents.length-1] === destination_id)
        {
            return response.json (null);
        }
        else
        {
            var newParents = destination.parents.concat (destination._id);
            await removeFromMonitorsByLock (_id);
            var newLock = await Lock.findByIdAndUpdate (_id, {parents: newParents}, {new: true});
            await addToMonitorsByLock (_id);
            return response.json (newLock);
        }
    },

    async iddestroy (request, response)
    {
        const {_id} = request.query;
        await removeFromMonitorsByLock (_id);
        await removeFromStatusByLock (_id);
        const lock = await Lock.findByIdAndDelete (_id);
        return response.json (lock);
    }
};