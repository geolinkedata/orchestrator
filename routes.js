var router = require('router'),
    route = router(),
    db = require('./db'),
    http = require('http'),
    geoserverConfig = require('./config.json').geoserver;
    tasks = require('./tasks');
    
var getToken = function(str, callback){
    if (str && typeof str === 'string'){
        var token = str.replace('Token ', '');
        callback(null, token);
    }
    else{
        console.log('authorization missing');
        callback(null, false);
    }
};


var sendResponse = function(error, data, res){
    if (error){
	res.writeHead(400);
	res.end('Error on server!');
    }
    else{
	res.writeHead(data.status);
	res.end(data.detail);
    }
};

var checkLayerStoredInGeoserverDb = function(layer, callback){
  var options = {
    host: geoserverConfig.host,
    port: geoserverConfig.port,
    path: geoserverConfig.restPath + '/layers.json',
    auth: geoserverConfig.auth
  };
  
  //console.log(layer);
    http.get(options, function(res) {
      if(res.statusCode === 200)
      {
	var data='';
	res.on('data', function(chunk){
	  if (chunk && typeof chunk!=='undefined')
	    data += chunk;
	});	
	res.on('end', function(){
 	  var jsonData = JSON.parse(data);
	  var layers = jsonData.layers.layer;
	  	  
	  for (var i=0; i < layers.length; i++){
	    if (layers[i].name === layer)
	    {
	      callback();	      
	    }
	  }
// 	  callback();
	});
      }
      else
	callback();
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    }); 
};



route.post('/loadShpInGeonode', function(req, res){
     getToken(req.headers.authorization, function(err, token){
        if (token !== false){
            db.auth.checkToken(token, function(err, result){
                if (result !== false){
                    var params = '';
                    req.on('data', function(data){
                        params+=data;
                    });
                    req.on('end', function(){
                        var job = {
                            params: params,
                            token: token,
                            user: result.user_id,
                            sendEmail: true,
			    shp: true,
			    loadInGeonode: true
                        };
                        tasks.handler(job, function(error, response){
			  checkLayerStoredInGeoserverDb(response.fileName);
			  sendResponse(error, response, res);
			});
                    });

                }
                else{
                    console.log('token not found!');
                }
            });
        }
     });
});

route.post('/loadShape', function(req, res){
    getToken(req.headers.authorization, function(err, token){
        if (token !== false){
            db.auth.checkToken(token, function(err, result){
                if (result !== false){
                    var params = '';
                    req.on('data', function(data){
                        params+=data;
                    });
                    req.on('end', function(){
                        var job = {
                            params: params,
                            token: token,
                            user: result.user_id,
                            sendEmail: true,
			    shp: true
                        };
                        tasks.handler(job, function(error, response){
			   sendResponse(error, response, res);
		        });
                         /*
                        tgeo.convertShape(params, function(tripleStoreFile){
                            console.log('Created: '+tripleStoreFile);
                        });*/
                    });
                    res.writeHead(200);
                    res.end('file stored in semantic db.');
                }
                else{
                    console.log('token not found!');
                }
            });
        }/*
        else{
            console.log('authorization missing!');
        }*/
    });
});


route.post('/loadTripleStore', function(req, res){
    getToken(req.headers.authorization, function(err, token){
        if (token!==false){
            db.auth.checkToken(token, function(err, result){
		if (result !== false){
		      var params = '';
		      req.on('data', function(data){
			  params+=data;
		      });
		      req.on('end', function(){
			  var job = {
			      params: params,
			      token: token,
			      user: result.user_id,
			      sendEmail: true
			  };
			  console.log(job.params);
                          tasks.handler(job, function(error, response){
			    sendResponse(error, response, res);
			});
		    });
		}
		else{
		  console.log('token not found!');
		}	
	    });
        }
    });
});


route.post('/convertShape', function(req, res){
    var b ='';
    req.on('data', function(data){
        b+=data;
    });
    req.on('end', function(){
        var job = {
            params: b
        };
        tasks.handler(job, function(error, response){
	  sendResponse(error, response, res);
	});
    });
    res.writeHead(200);
    res.end('');
});

exports.route = route;
