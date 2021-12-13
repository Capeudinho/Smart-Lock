const {Router} = require ("express");
const axios = require ("axios").default;
const {accessCheck} = require ("./accessManager");
const {statusUpdate} = require ("./statusManager");
const Account = require ("../models/Account");
const Lock = require ("../models/Lock");

var routes = Router ();
var httpManagerRoutes = routes;

const api = axios.create ();

var accessCheckRouteRelations = [];
var statusUpdateRouteRelations = [];
var accessCheckRoutes = [];
var statusUpdateRoutes = [];

async function addToHttp ()
{
    var accounts = await Account.find ().lean ();
    for (var a = 0; a < accounts.length; a++)
    {
        var foundAccessCheckRoute = false;
        var foundStatusUpdateRoute = false;
        for (var b = 0; b < accessCheckRouteRelations.length; b++)
        {
            if (accessCheckRouteRelations[b].route === accounts[a].connectionOptions.accessCheckRoute)
            {
                accessCheckRouteRelations[b].uses = accessCheckRouteRelations[b].uses+1;
                foundAccessCheckRoute = true;
            }
        }
        for (var c = 0; c < statusUpdateRouteRelations.length; c++)
        {
            if (statusUpdateRouteRelations[c].route === accounts[a].connectionOptions.statusUpdateRoute)
            {
                statusUpdateRouteRelations[c].uses = statusUpdateRouteRelations[c].uses+1;
                foundStatusUpdateRoute = true;
            }
        }
        if (foundAccessCheckRoute === false)
        {
            accessCheckRouteRelations.push ({route: accounts[a].connectionOptions.accessCheckRoute, uses: 1});
            accessCheckRoutes.push ("/"+accounts[a].connectionOptions.accessCheckRoute);
        }
        if (foundStatusUpdateRoute === false)
        {
            statusUpdateRouteRelations.push ({route: accounts[a].connectionOptions.statusUpdateRoute, uses: 1});
            statusUpdateRoutes.push ("/"+accounts[a].connectionOptions.statusUpdateRoute);
        }
    }
    setRoutes ();
}

async function addToHttpByAccount (accountId)
{
    var account = await Account.findById (accountId).lean ();
    var foundAccessCheckRoute = false;
    var foundStatusUpdateRoute = false;
    for (var a = 0; a < accessCheckRouteRelations.length; a++)
    {
        if (accessCheckRouteRelations[a].route === account.connectionOptions.accessCheckRoute)
        {
            accessCheckRouteRelations[a].uses = accessCheckRouteRelations[a].uses+1;
            foundAccessCheckRoute = true;
        }
    }
    for (var b = 0; b < statusUpdateRouteRelations.length; b++)
    {
        if (statusUpdateRouteRelations[b].route === account.connectionOptions.statusUpdateRoute)
        {
            statusUpdateRouteRelations[b].uses = statusUpdateRouteRelations[b].uses+1;
            foundStatusUpdateRoute = true;
        }
    }
    if (foundAccessCheckRoute === false)
    {
        accessCheckRouteRelations.push ({route: account.connectionOptions.accessCheckRoute, uses: 1});
        accessCheckRoutes.push ("/"+account.connectionOptions.accessCheckRoute);
    }
    if (foundStatusUpdateRoute === false)
    {
        statusUpdateRouteRelations.push ({route: account.connectionOptions.statusUpdateRoute, uses: 1});
        statusUpdateRoutes.push ("/"+account.connectionOptions.statusUpdateRoute);
    }
}

function addToHttpByRoutes ()
{
    setRoutes ();
}

async function removeFromHttpByAccount (accountId)
{
    var account = await Account.findById (accountId).lean ();
    for (var a = 0; a < accessCheckRouteRelations.length; a++)
    {
        if (accessCheckRouteRelations[a].route === account.connectionOptions.accessCheckRoute)
        {
            accessCheckRouteRelations[a].uses = accessCheckRouteRelations[a].uses-1;
            if (accessCheckRouteRelations[a].uses === 0)
            {
                accessCheckRouteRelations.splice (a, 1);
                accessCheckRoutes.splice (a, 1);
            }
        }
    }
    for (var b = 0; b < statusUpdateRouteRelations.length; b++)
    {
        if (statusUpdateRouteRelations[b].route === account.connectionOptions.statusUpdateRoute)
        {
            statusUpdateRouteRelations[b].uses = statusUpdateRouteRelations[b].uses-1;
            if (statusUpdateRouteRelations[b].uses === 0)
            {
                statusUpdateRouteRelations.splice (b, 1);
                statusUpdateRoutes.splice (b, 1);
            }
        }
    }
}

async function openHttpLockById (lockId)
{
    var lock = await Lock.findById (lockId).lean ();
    var account = await Account.findById (lock.owner).lean ();
    await api.get
    (
        "http://"+lock.host+":"+lock.port+"/"+account.connectionOptions.directCommandRoute,
        {
            params:
            {
                command: "open"
            }
        }
    );
}

async function handleAccessCheck (request, response)
{
    if
    (
        typeof request.query === "object" &&
        !Array.isArray (request.query) &&
        request.query !== null &&
        request.query.hasOwnProperty ("lockPIN") &&
        request.query.hasOwnProperty ("userPIN") &&
        request.query.hasOwnProperty ("identifier") &&
        typeof request.query.lockPIN === "string" &&
        typeof request.query.userPIN === "string" &&
        typeof request.query.identifier === "string"
    )
    {
        const {lockPIN, userPIN, identifier} = request.query;
        var account = await Account.findOne ({"connectionOptions.identifier": identifier});
        var lock = await Lock.findOne ({PIN: lockPIN, owner: account._id}).lean ();
        if (lock !== null)
        {
            var reply = await accessCheck (lockPIN, userPIN, identifier);
            try
            {
                if (reply)
                {
                    await api.get
                    (
                        "http://"+lock.host+":"+lock.port+"/"+account.connectionOptions.accessReplyRoute,
                        {
                            params:
                            {
                                command: "open"
                            }
                        }
                    );
                }
                else
                {
                    await api.get
                    (
                        "http://"+lock.host+":"+lock.port+"/"+account.connectionOptions.accessReplyRoute,
                        {
                            params:
                            {
                                command: "close"
                            }
                        }
                    );
                }
            }
            catch (error) {}
        }
    }
    return response.json ();
}

async function handleStatusUpdate (request, response)
{
    if
    (
        typeof request.query === "object" &&
        !Array.isArray (request.query) &&
        request.query !== null &&
        request.query.hasOwnProperty ("lockPIN") &&
        request.query.hasOwnProperty ("lockStatus") &&
        request.query.hasOwnProperty ("identifier") &&
        typeof request.query.lockPIN === "string" &&
        typeof request.query.lockStatus === "string" &&
        typeof request.query.identifier === "string"
    )
    {
        try
        {
            request.query.lockStatus = JSON.parse (request.query.lockStatus);
            if
            (
                typeof request.query.lockStatus === "object" &&
                !Array.isArray (request.query.lockStatus) &&
                request.query.lockStatus !== null
            )
            {
                var {lockPIN, lockStatus, identifier} = request.query;
                await statusUpdate (lockPIN, lockStatus, identifier);
            }
        }
        catch (e)
        {
            return response.json ();
        }
    }
    return response.json ();
}

function setRoutes ()
{
    routes.stack.splice (0, 2);
    routes.get
    (
        accessCheckRoutes,
        async (request, response) =>
        {
            await handleAccessCheck (request, response);
        }
    );
    routes.get
    (
        statusUpdateRoutes,
        async (request, response) =>
        {
            await handleStatusUpdate (request, response);
        }
    );
}

module.exports =
{
    addToHttp,
    addToHttpByAccount,
    addToHttpByRoutes,
    removeFromHttpByAccount,
    openHttpLockById,
    httpManagerRoutes
};