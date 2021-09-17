const {Router} = require ("express");
const AccountController = require ("./controllers/AccountController");
const UserController = require ("./controllers/UserController");
const ItemController = require ("./controllers/ItemController");
const GroupController = require ("./controllers/GroupController");
const LockController = require ("./controllers/LockController");
const RoleController = require ("./controllers/RoleController");
const TimeController = require ("./controllers/TimeController");
const LogController = require ("./controllers/LogController");

const routes = Router ();

routes.get ("/accountlist", AccountController.list);
routes.get ("/accountidindex", AccountController.idindex);
routes.get ("/accountloginindex", AccountController.loginindex);
routes.post ("/accountstore", AccountController.store);
routes.put ("/accountidupdate", AccountController.idupdate);
routes.put ("/accountconnectionoptionsidupdate", AccountController.connectionoptionsidupdate);
routes.delete ("/accountiddestroy", AccountController.iddestroy);

routes.get ("/userlist", UserController.list);
routes.get ("/userlistpag", UserController.listpag);
routes.get ("/useridindex", UserController.idindex);
routes.post ("/userstore", UserController.store);
routes.put ("/useridupdate", UserController.idupdate);
routes.delete ("/useriddestroy", UserController.iddestroy);

routes.get ("/itemlist", ItemController.list);
routes.get ("/itemlistpag", ItemController.listpag);
routes.get ("/itemidindex", ItemController.idindex);
routes.get ("/itemparentindex", ItemController.parentindex);
routes.get ("/itemparentindexpag", ItemController.parentindexpag);
routes.post ("/itemstore", ItemController.store);
routes.put ("/itemidupdate", ItemController.idupdate);
routes.delete ("/itemiddestroy", ItemController.iddestroy);

routes.get ("/grouplist", GroupController.list);
routes.get ("/groupidindex", GroupController.idindex);
routes.post ("/groupstore", GroupController.store);
routes.put ("/groupidupdate", GroupController.idupdate);
routes.put ("/groupidupdatemove", GroupController.idupdatemove);
routes.delete ("/groupiddestroy", GroupController.iddestroy);

routes.get ("/locklist", LockController.list);
routes.get ("/lockidindex", LockController.idindex);
routes.get ("/lockidopen", LockController.idopen);
routes.post ("/lockstore", LockController.store);
routes.put ("/lockidupdate", LockController.idupdate);
routes.put ("/lockidupdatemove", LockController.idupdatemove);
routes.delete ("/lockiddestroy", LockController.iddestroy);

routes.get ("/rolelist", RoleController.list);
routes.get ("/rolelistpag", RoleController.listpag);
routes.get ("/roleidindex", RoleController.idindex);
routes.post ("/rolestore", RoleController.store);
routes.put ("/roleidupdate", RoleController.idupdate);
routes.delete ("/roleiddestroy", RoleController.iddestroy);

routes.get ("/timelist", TimeController.list);
routes.get ("/timeidindex", TimeController.idindex);
routes.post ("/timestore", TimeController.store);
routes.put ("/timeidupdate", TimeController.idupdate);
routes.delete ("/timeiddestroy", TimeController.iddestroy);

routes.get ("/loglist", LogController.list);
routes.get ("/loglistpag", LogController.listpag);
routes.get ("/logidindex", LogController.idindex);
routes.post ("/logstore", LogController.store);
routes.put ("/logidupdate", LogController.idupdate);
routes.delete ("/logiddestroy", LogController.iddestroy);

module.exports = routes;