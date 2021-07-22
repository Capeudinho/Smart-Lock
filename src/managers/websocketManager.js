const app = require ("../index");
server = require ("http").createServer (app);
const io = require ("socket.io") (server);

io.on
(
    "connection",
    (client) =>
    {
        //client.on
        //(
        //    "test",
        //    () => {}
        //)
    }
);

server.listen (3001);

module.exports = io;