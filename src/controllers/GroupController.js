const Group = require ("../models/Group");
const Item = require("../models/Item");
const {addToMonitorsByGroup, removeFromMonitorsByGroup} = require ("../managers/monitorManager");

module.exports =
{
    async list (request, response)
    {
        const {owner} = request.query;
        const groups = await Group.find ({owner});
        return response.json (groups);
    },
    
    async idindex (request, response)
    {
        const {_id} = request.query;
        const group = await Group.findById (_id);
        return response.json (group);
    },

    async store (request, response)
    {
        const {name, lastParent, roles, usedTimes, owner} = request.body;
        const parent = await Group.findById (lastParent).lean ();
        var parents = parent.parents.concat (lastParent);
        const newGroup = await Group.create ({name, parents, roles, usedTimes, owner});
        return response.json (newGroup);
    },

    async idupdate (request, response)
    {
        const {_id} = request.query;
        const {name, roles, usedTimes, owner} = request.body;
        await removeFromMonitorsByGroup (_id);
        var newGroup = await Group.findByIdAndUpdate (_id, {name, roles, usedTimes, owner}, {new: true});
        await addToMonitorsByGroup (_id);
        return response.json (newGroup);
    },

    async idupdatemove (request, response)
    {
        const {_id, destination_id} = request.query;
        var group = await Group.findById (_id).lean ();
        var destination = await Group.findById (destination_id).lean ();
        if (destination.parents.includes (_id) || destination_id === _id || group.parents[group.parents.length-1] === destination_id)
        {
            return response.json (null);
        }
        else
        {
            var newParents = destination.parents.concat (destination._id);
            await removeFromMonitorsByGroup (_id);
            var newGroup = await Group.findByIdAndUpdate (_id, {parents: newParents}, {new: true});
            await Item.updateMany ({parents: _id}, {$pullAll: {parents: group.parents}}).lean ();
            await Item.updateMany ({parents: _id}, {$push: {parents: {$each: newParents, $position: 0}}}).lean ();
            await addToMonitorsByGroup (_id);
            return response.json (newGroup);
        }
    },

    async iddestroy (request, response)
    {
        const {_id} = request.query;
        await removeFromMonitorsByGroup (_id);
        const group = await Group.findByIdAndDelete (_id);
        await Item.deleteMany ({parents: _id});
        return response.json (group);
    }
};