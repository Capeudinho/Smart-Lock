const Lock = require ("../models/Lock");
const Group = require ("../models/Group");
const Item = require ("../models/Item");
const {addToMonitorsByLock, removeFromMonitorsByLock} = require ("../managers/monitorManager");

module.exports =
{
    async list (request, response)
    {
        const {owner} = request.query;
        const locks = await Lock.find ({owner});
        return response.json (locks);
    },
    
    async idindex (request, response)
    {
        const {_id} = request.query;
        const lock = await Lock.findById (_id);
        return response.json (lock);
    },

    async store (request, response)
    {
        const {name, lastParent, owner} = request.body;
        const parent = await Item.findById (lastParent).lean ();
        var parents = parent.parents.concat (lastParent);
        const newLock = await Lock.create ({name, parents, owner});
        await addToMonitorsByLock (newLock._id);
        return response.json (newLock);
    },

    async idupdate (request, response)
    {
        const {_id} = request.query;
        const {name, owner} = request.body;
        var newLock = await Lock.findByIdAndUpdate (_id, {name, owner}, {new: true});
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
        const lock = await Lock.findByIdAndDelete (_id);
        return response.json (lock);
    }
};