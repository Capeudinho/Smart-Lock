const User = require ("../models/User");
const {addToMonitorsByUser, removeFromMonitorsByUser} = require ("../managers/monitorManager");

module.exports =
{
    async list (request, response)
    {
        const {owner} = request.query;
        const users = await User.find ({owner});
        return response.json (users);
    },

    async listpag (request, response)
    {
        var {page, name, owner} = request.query;
        if (name === "") {var nameValue = {$exists: true};}
        else {var nameValue = {"$regex": name, "$options": "i"};}
        const users = await User.paginate ({name: nameValue, owner}, {page, limit: 20});
        return response.json (users);
    },
    
    async idindex (request, response)
    {
        const {_id} = request.query;
        const user = await User.findById (_id).populate ({path: "roles", populate: {path: "times"}});
        return response.json (user);
    },

    async store (request, response)
    {
        const {name, PINs, roles, usedTimes, owner} = request.body;
        var newUser = await User.create ({name, PINs, roles, usedTimes, owner});
        return response.json (newUser);
    },

    async idupdate (request, response)
    {
        const {_id} = request.query;
        const {name, PINs, roles, usedTimes, owner} = request.body;
        await removeFromMonitorsByUser (_id);
        var newUser = await User.findByIdAndUpdate (_id, {name, PINs, roles, usedTimes, owner}, {new: true});
        await addToMonitorsByUser (_id);
        return response.json (newUser);
    },

    async iddestroy (request, response)
    {
        const {_id} = request.query;
        await removeFromMonitorsByUser (_id);
        const user = await User.findByIdAndDelete (_id);
        return response.json (user);
    }
};