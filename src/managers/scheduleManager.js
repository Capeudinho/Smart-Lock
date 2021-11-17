const schedule = require ("node-schedule");
const {checkMonitors} = require ("./monitorManager");
const Role = require ("../models/Role");
const Time = require ("../models/Time");

var schedules = [];

async function addToSchedules ()
{
    var times = await Time.find ();
    times.map
    (
        (time) =>
        {
            if (time.trackMiss)
            {
                var minute = time.end%60;
                var hour = (time.end-minute)/60;
                var days = [];
                time.days.map
                (
                    (day, index)=>
                    {
                        if (day === true)
                        {
                            days.push (index);
                        }
                    }
                );
                if (days.length > 0)
                {
                    var rule = new schedule.RecurrenceRule ();
                    rule.dayOfWeek = days;
                    rule.hour = hour;
                    rule.minute = minute;
                    schedules.push
                    (
                        {
                            timeId: time._id,
                            job: schedule.scheduleJob
                            (
                                {rule},
                                async () =>
                                {
                                    await checkMonitors (time.owner, time._id);
                                }
                            )
                        }
                    );
                }
            }
        }
    );
}

async function addToSchedulesByRole (roleId)
{
    var role = await Role.findById (roleId).populate ("times").lean ();
    var times = role.times;
    times.map
    (
        (time) =>
        {
            if (time.trackMiss)
            {
                var minute = time.end%60;
                var hour = (time.end-minute)/60;
                var days = [];
                time.days.map
                (
                    (day, index)=>
                    {
                        if (day === true)
                        {
                            days.push (index);
                        }
                    }
                );
                if (days.length > 0)
                {
                    var rule = new schedule.RecurrenceRule ();
                    rule.dayOfWeek = days;
                    rule.hour = hour;
                    rule.minute = minute;
                    schedules.push
                    (
                        {
                            timeId: time._id,
                            job: schedule.scheduleJob
                            (
                                {rule},
                                async () =>
                                {
                                    await checkMonitors (time.owner, time._id);
                                }
                            )
                        }
                    );
                }
            }
        }
    );
}

async function removeFromSchedulesByRole (roleId)
{
    var role = await Role.findById (roleId).populate ("times").lean ();
    var times = role.times;
    times.map
    (
        (time) =>
        {
            for (var a = 0; a < schedules.length; a++)
            {
                if (time._id.toString () === schedules[a].timeId.toString ())
                {
                    schedules[a].job.cancel ();
                    schedules.splice (a, 1);
                    a = schedules.length;
                }
            }
        }
    );
}

module.exports = {addToSchedules, addToSchedulesByRole, removeFromSchedulesByRole};