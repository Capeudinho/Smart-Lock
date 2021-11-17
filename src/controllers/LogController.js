const Log = require ("../models/Log");

module.exports =
{
    async list (request, response)
    {
        const logs = await Log.find ().lean ();
        return response.json (logs);
    },

    async listpag (request, response)
    {
        var {page, user, item, role, start, end, owner} = request.query;
        if (user === "") {var userValue = {$exists: true};}
        else {var userValue = {"$regex": user, "$options": "i"};}
        if (item === "") {var itemValue = {$exists: true};}
        else {var itemValue = {"$regex": item, "$options": "i"};}
        if (role === "") {var roleValue = {$exists: true};}
        else {var roleValue = {"$regex": role, "$options": "i"};}
        if (start === "") {var startValue = {$exists: true};}
        else {var startValue = {$gte: new Date (start+":00.000Z")};}
        if (end === "") {var endValue = {$exists: true};}
        else {var endValue = {$lte: new Date (end+":00.000Z")};}
        const logs = await Log.paginate
        (
            {
                user: userValue,
                path: itemValue,
                role: roleValue,
                creationDate: {...startValue, ...endValue},
                owner
            },
            {
                page,
                limit: 50,
                sort: "-creationDate",
                lean: true
            }
        );
        return response.json (logs);
    },
    
    async idindex (request, response)
    {
        const {_id} = request.query;
        const log = await Log.findById (_id).lean ();
        return response.json (log);
    },

    async store (request, response)
    {
        const {user, lock, path, role, type, creationDate, owner} = request.body;
        var newLog = await Log.create ({user, lock, path, role, type, creationDate, owner});
        return response.json (newLog);
    },

    async idupdate (request, response)
    {
        const {_id} = request.query;
        const {user, lock, path, role, type, creationDate, owner} = request.body;
        var newLog = await Log.findByIdAndUpdate (_id, {user, lock, path, role, type, creationDate, owner}, {new: true});
        return response.json (newLog);
    },

    async iddestroy (request, response)
    {
        const {_id} = request.query;
        const log = await Log.findByIdAndDelete (_id);
        return response.json (log);
    }
};