const Item = require ("../models/Item");
const Role = require ("../models/Role");
const Time = require ("../models/Time");
const {getStatusByLock} = require ("../managers/statusManager");

module.exports =
{
    async list (request, response)
    {
        const items = await Item.find ().lean ();
        return response.json (items);
    },

    async listpag (request, response)
    {
        var {page, name, owner} = request.query;
        if (name === "") {var nameValue = {$exists: true};}
        else {var nameValue = {"$regex": name, "$options": "i"};}
        var items = await Item.paginate ({name: nameValue, owner, "parents.0": {$exists: true}}, {page, limit: 50, lean: true});
        for (var a = 0; a < items.docs.length; a++)
        {
            items.docs[a].parentInfos = [];
            const parents = await Item.find ({_id: items.docs[a].parents}).lean ();
            parents.push (items.docs[a]);
            for (var b = 0; b < parents.length; b++)
            {
                items.docs[a].parentInfos.push ({_id: parents[b]._id, name: parents[b].name, type: parents[b].type});
            }
        }
        return response.json (items);
    },
    
    async idindex (request, response)
    {
        const {_id} = request.query;
        var item = await Item.findById (_id).lean ();
        if (item.type === "Group")
        {
            for (var a = 0; a < item.roles.length; a++)
            {
                item.roles[a] = await Role.findById (item.roles[a]).lean ();
                for (var b = 0; b < item.roles[a].times.length; b++)
                {
                    item.roles[a].times[b] = await Time.findById (item.roles[a].times[b]).lean ();
                }
            }
        }
        else
        {
            var status = await getStatusByLock (_id);
            item.status = status;
        }
        return response.json (item);
    },

    async parentindex (request, response)
    {
        const {parent, owner} = request.query;
        if (parent.length === 0)
        {
            var items = await Item.find ({parents: {$size: 0}, owner}).lean ();
        }
        else
        {
            var items = await Item.find ({$expr: {$eq: [{"$arrayElemAt": ["$parents", -1]}, parent]}}).lean ();
        }
        return response.json (items);
    },

    async parentindexpag (request, response)
    {
        const {page, parent} = request.query;
        var items = await Item.paginate ({$expr: {$eq: [{"$arrayElemAt": ["$parents", -1]}, parent]}}, {page, limit: 50});
        var lastParent = await Item.findById (parent).lean ();
        var parents = await Item.find ({_id: lastParent.parents}).lean ();
        parents.push (lastParent);
        var parentInfos = [];
        for (var a = 0; a < parents.length; a++)
        {
            parentInfos.push ({_id: parents[a]._id, name: parents[a].name, type: parents[a].type});
        }
        return response.json ({items, parentInfos});
    },

    async store (request, response)
    {
        const {name, parents, owner} = request.body;
        var newItem = await Item.create ({name, parents, owner});
        return response.json (newItem);
    },

    async idupdate (request, response)
    {
        const {_id} = request.query;
        const {name, parents, owner} = request.body;
        var newItem = await Item.findByIdAndUpdate (_id, {name, parents, owner}, {new: true});
        return response.json (newItem);
    },

    async iddestroy (request, response)
    {
        const {_id} = request.query;
        const item = await Item.findByIdAndDelete (_id);
        return response.json (item);
    }
};