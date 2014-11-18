//var router = require('router'),
    //route = router(),
var db = require('./db'),
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
	  var layerUri=false;
	  for (var i=0; i < layers.length; i++){
	    if (layers[i].name === layer)
	    {
	      	 layerUri = layers[i].href;
		 break;
	    }
	  }
	  callback(false, layerUri);
	});
      }
      else
	callback(false, false);
    }).on('error', function(e) {
     // console.log("Got error: " + e.message);
      callback(e.message, false);
    }); 
};


var getLayerData = function(layerUri, callback){
    var options = {
      host: geoserverConfig.host,
      port: geoserverConfig.port,
      path: layerUri,
      auth: geoserverConfig.auth
    };  
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
	  options.path=jsonData.layer.resource.href;
	  http.get(options, function(res1) {
	    var data1='';
	    res1.on('data', function(chunk){
	      
	      if (chunk && typeof chunk!=='undefined')
		data1 += chunk;
	    });
	    res1.on('end', function(){
	      var jsonData1 = JSON.parse(data1);
	      callback(false, jsonData1);
	    });
	  }).on('error', function(e) {
		callback(e.message, false);
	  });
	});
      }
      else
	callback(false, false);
    }).on('error', function(e) {
      callback(e.message, false);
    });      
};


var getLayerInfo = function(layerUri, callback){
    var options = {
      host: geoserverConfig.host,
      port: geoserverConfig.port,
      path: layerUri,
      auth: geoserverConfig.auth
    };
    
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
	  callback(false, jsonData);
	});
      }
      else
	callback(false, false);
    }).on('error', function(e) {
      callback(e.message, false);
    });     
    
};

exports.config = function(app){
    app.post('/loadShpInGeonode', function(req, res){
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
			      
			      sendResponse(error, response, res);
			     // checkLayerStoredInGeoserverDb(response.fileName, 
				//			    function(error, response){
				//sendResponse(error, response, res);
			     // });
			      
			    });
			});

		    }
		    else{
			sendResponse(false, {status: 401, detail: 'unauthorized'}, res);
		    }
		});
	    }
	});
    });

    app.post('/loadShape', function(req, res){
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
			sendResponse(false, {status: 401, detail: 'unauthorized'}, res);
		    }
		});
	    }/*
	    else{
		console.log('authorization missing!');
	    }*/
	});
    });


    app.post('/loadTripleStore', function(req, res){
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
		      sendResponse(false, {status: 401, detail: 'unauthorized'}, res);
		    }	
		});
	    }
	});
    });


    app.post('/convertShape', function(req, res){
	var b ='';
	req.on('data', function(data){
	    b+=data;
	});
	
	req.on('error', function(err){
	  sendReponse(error, false, res);
	});
	
	req.on('end', function(){
	    var job = {
		params: b,
		convertOnly: true
	    };
	    tasks.handler(job, function(error, response){
	      sendResponse(error, response, res);
	    });
	});
	//res.writeHead(200);
	//res.end('');
    });
    
    
    app.get('/map/:layer', function(req, res){     
      checkLayerStoredInGeoserverDb(req.params.layer, function(error, response){
		
	  if (error)
	  {
	    console.log("Got error: " + e.message);
	    return;
	  }
	  	  
	  if (response)
	  {	 
	    getLayerData(response, function(err, responseInfo){
	      if (responseInfo.featureType && typeof responseInfo.featureType!=='undefined')
	      {
		  var resData=responseInfo.featureType;
		  var qs='ns='+resData.namespace.name+'&layer='+resData.name;
		  qs+='&minx='+resData.nativeBoundingBox.minx;
		  qs+='&miny='+resData.nativeBoundingBox.miny;
		  qs+='&maxx='+resData.nativeBoundingBox.maxx;
		  qs+='&maxy='+resData.nativeBoundingBox.maxy;
		  qs+='&crs='+resData.nativeBoundingBox.crs;
		  qs+='&srs='+resData.srs;
		  
		  res.redirect('/bootleaf/index.html?'+qs);
	      }
	      else
	      {
		  res.send('errore nella ricezione dei dati del layer!');
	      }
	    });
	  }
	  else
	  {
	    res.send('Layer non trovato!');
	  }
        });    
    });
}

