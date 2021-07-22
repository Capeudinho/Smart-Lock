const Time = require ("../models/Time");

module.exports =
{
    async list (request, response)
    {
        const {owner} = request.query;
        const times = await Time.find ({owner});
        return response.json (times);
    },
    
    async idindex (request, response)
    {
        const {_id} = request.query;
        const time = await Time.findById (_id);
        return response.json (time);
    },

    async store (request, response)
    {
        const {start, end, days, use, trackAccess, trackMiss, owner} = request.body;
        var newTime = await Time.create ({start, end, days, use, trackAccess, trackMiss, owner});
        return response.json (newTime);
    },

    async idupdate (request, response)
    {
        const {_id} = request.query;
        const {start, end, days, use, trackAccess, trackMiss, owner} = request.body;
        var newTime = await Time.findByIdAndUpdate (_id, {start, end, days, use, trackAccess, trackMiss, owner}, {new: true});
        return response.json (newTime);
    },

    async iddestroy (request, response)
    {
        const {_id} = request.query;
        const time = await Time.findByIdAndDelete (_id);
        return response.json (time);
    }
};