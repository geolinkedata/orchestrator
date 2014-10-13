var http = require('http'),
    routing = require('./routes'),
    tasks = require('./tasks'),
    port = require('./config.json').serverPort,
    config = require('./config.json').tgeo,
    timeout = require('./config.json').timeout;

var tgeo = {
    host: config.host,
    port: config.port,
    path: config.appUrl,
    method: 'GET'
};


//checks if tgeo is running
var req = http.request(tgeo, function(res){

    res.on('data', function(chunk){
       ;
    });

    res.on('end', function(err){
        http.createServer(routing.route).listen(port);

        setInterval(function(){
            tasks.periodicHandler();
        }, timeout);
    });
})



req.on('error', function(e) {
    console.log('problem with request: ' + e.message + '. Are jetty and triplegeo running?');
});

req.end();

/*

*/
