const Role = require ("../models/Role");
const User = require ("../models/User");
const Group = require ("../models/Group");
const Time = require ("../models/Time");
const {addToMonitorsByRole, removeFromMonitorsByRole} = require ("../managers/monitorManager");
const {addToSchedulesByRole, removeFromSchedulesByRole} = require ("../managers/scheduleManager");

module.exports =
{
    async list (request, response)
    {
        const roles = await Role.find ().lean ();
        return response.json (roles);
    },

    async listowner (request, response)
    {
        const {owner} = request.query;
        const roles = await Role.find ({owner}).populate ("times").lean ();
        return response.json (roles);
    },

    async listpag (request, response)
    {
        var {page, name, owner} = request.query;
        if (name === "") {var nameValue = {$exists: true};}
        else {var nameValue = {"$regex": name, "$options": "i"};}
        const roles = await Role.paginate ({name: nameValue, owner}, {page, limit: 50});
        return response.json (roles);
    },
    
    async idindex (request, response)
    {
        const {_id} = request.query;
        const role = await Role.findById (_id).populate ("times").lean ();
        return response.json (role);
    },

    async store (request, response)
    {
        const {name, times, owner} = request.body;
        const newRole = await Role.create ({name, times, owner});
        return response.json (newRole);
    },

    async idupdate (request, response)
    {
        const {_id} = request.query;
        const {name, timeInfos, owner} = request.body;
        const role = await Role.findById (_id).populate ("times").lean ();
        var times = [];
        var deletedTimes = [];
        var addedUsedTimes = [];
        for (var a = 0; a < timeInfos.length; a++)
        {
            if (timeInfos[a]._id.split ("/////")[0] === "createdTime")
            {
                var newTime = await Time.create
                (
                    {
                        start: timeInfos[a].start,
                        end: timeInfos[a].end,
                        days: timeInfos[a].days,
                        use: timeInfos[a].use,
                        trackAccess: timeInfos[a].trackAccess,
                        trackMiss: timeInfos[a].trackMiss,
                        owner
                    }
                );
                if (newTime.use)
                {
                    addedUsedTimes.push (newTime._id);
                }
                times.push (newTime._id);
            }
            else
            {
                await Time.findByIdAndUpdate
                (
                    timeInfos[a]._id,
                    {
                        start: timeInfos[a].start,
                        end: timeInfos[a].end,
                        days: timeInfos[a].days,
                        use: timeInfos[a].use,
                        trackAccess: timeInfos[a].trackAccess,
                        trackMiss: timeInfos[a].trackMiss,
                        owner
                    }
                );
                times.push (timeInfos[a]._id);
            }
        }
        for (var c = 0; c < role.times.length; c++)
        {
            var deletedTime = true;
            for (var d = 0; d < timeInfos.length; d++)
            {
                if (role.times[c]._id == timeInfos[d]._id)
                {
                    deletedTime = false;
                }
            }
            if (deletedTime)
            {
                deletedTimes.push (role.times[c]._id);
            }
        }
        await removeFromSchedulesByRole (_id);
        await removeFromMonitorsByRole (_id);
        const newRole = await Role.findByIdAndUpdate (_id, {name, times, owner}, {new: true}).populate ("times").lean ();
        await Time.deleteMany ({_id: {$in: deletedTimes}});
        await User.updateMany ({roles: _id}, {$pull: {usedTimes: {$in: deletedTimes}}});
        await User.updateMany ({roles: _id}, {$push: {usedTimes: {$each: addedUsedTimes}}});
        await Group.updateMany ({roles: _id}, {$pull: {usedTimes: {$in: deletedTimes}}});
        await Group.updateMany ({roles: _id}, {$push: {usedTimes: {$each: addedUsedTimes}}});
        await addToMonitorsByRole (_id);
        await addToSchedulesByRole (_id);
        return response.json (newRole);
    },

    async iddestroy (request, response)
    {
        const {_id} = request.query;
        await removeFromSchedulesByRole (_id);
        await removeFromMonitorsByRole (_id);
        const role = await Role.findByIdAndDelete (_id);
        await Time.deleteMany ({_id: {$in: role.times}});
        await User.updateMany ({roles: _id}, {$pull: {roles: _id, usedTimes: {$in: role.times}}});
        await Group.updateMany ({roles: _id}, {$pull: {roles: _id, usedTimes: {$in: role.times}}});
        return response.json (role);
    }
};