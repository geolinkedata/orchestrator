var http = require('http'),
    routing = require('./routes'),
    tasks = require('./tasks'),
    port = require('./config.json').serverPort,
    timeout = require('./config.json').timeout;


http.createServer(routing.route).listen(port);


setInterval(function(){
    tasks.periodicHandler();
}, timeout);
