var http = require('http'),
    route = require('./routes'),
    tasks = require('./tasks'),
    port = require('./config.json').serverPort,
    configTgeo = require('./config.json').tgeo,
    timeout = require('./config.json').timeout,
    express = require('express'),
    path = require('path');
    
    
var app = express();  
app.set('port', port);

//app.use(app.router);
app.use(express.static(path.join(__dirname, '/public')));

route.config(app);

var tgeo = {
    host: configTgeo.host,
    port: configTgeo.port,
    path: configTgeo.appUrl,
    method: 'GET'
};



/*
	http.createServer(app).listen(app.get('port'), function(){
	    console.log('Express server listening on port ' + port);
	});*/

//checks if tgeo is running
var req = http.request(tgeo, function(res){

    res.on('data', function(chunk){
       ;
    });

    res.on('end', function(err){
        //http.createServer(routing.route).listen(port);
	http.createServer(app).listen(app.get('port'), function(){
	    console.log('Express server listening on port ' + port);
	});
	
        setInterval(function(){
            tasks.periodicHandler();
        }, timeout);
    });
});



req.on('error', function(e) {
    console.log('problem with request: ' + e.message + '. Are tomcat and triplegeo running?');
});

req.end();



