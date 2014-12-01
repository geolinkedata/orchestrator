var http = require('http'),
    qs = require('querystring'),
    fs = require('fs'),
    logger = require('./utils/logger'),
    config = require('./config.json').tgeo;


/**
 * Description
 * @method convertShape
 * @param {} params
 * @param {} callback
 * @return
 */
exports.convertShape = function(params, callback){

    var tgeo = {
        host: config.host,
        port: config.port,
        path: config.appUrl+params,
        method: 'POST'
    };
    var arrParams = qs.parse(params);
    var stats = fs.statSync(arrParams.inputFile);

    var triplegeoLogs = function(statusCode, headers, body){
	if (statusCode===200){
	  logger.info('TRIPLEGEO STATUS: ' + statusCode);
	  logger.info('Triple store resource created.');
	}
	else{
	  logger.error('TRIPLEGEO STATUS: ' + statusCode);
	  logger.error('TRIPLEGEO HEADERS:' + headers);
	  logger.error('TRIPLEGEO BODY:' + body);
	}
    };
    
    var req = http.request(tgeo, function(res){
 
	
       // var headers='TRIPLEGEO STATUS: ' + res.statusCode;
        var headers = JSON.stringify(res.headers);
	var body = '';
	
        res.setEncoding('utf8');

        //doesn't work without on data event!!!
        res.on('data', function(chunk){
            body+=chunk;
        });

        res.on('end', function(){
            //move resulting triple store file
            var resFile=config.defaultResultFile+arrParams.outputFile.substring(
                arrParams.outputFile.lastIndexOf('.'));

            //move triple-store file created by triplegeo
            var is = fs.createReadStream(resFile);
	    is.on('error', function(err){
	      triplegeoLogs(res.statusCode, headers, body);
	      logger.error('ERROR, triple store resource not created by Triplegeo!');
	      callback({status: 500, detail: 'Error, triple store resource not created!'}, false);	      
	    });	    
	    is.on('open', function(err){
	      if (err){
		 logger.error('error! Cannot open triple store saved file');
		 callback({status: 500, detail: 'Internal server error.'}, false);		
	      }
	      var os = fs.createWriteStream(arrParams.outputFile);
	      is.pipe(os);	      
	    });
            is.on('end', function(){
                fs.unlink(resFile, function(err){
                    if(err){
		      logger.error('error! Cannot unlink triple store file');
		      callback({status: 500, detail: 'Internal server error.'}, false);
                    }
                    triplegeoLogs(res.statusCode, headers, body);
                    callback(false, arrParams.outputFile);
                });
            });
        });

        res.on('error', function(){	   
            console.log('ERROR.');
	    callback({status: 500, detail: 'Error, Internal server error.'}, false);
        });

    });

    req.on('error', function(e) {      
        console.log('problem with request: ' + e.message);
	callback({status: 400, detail: 'Error, Bad request.'}, false);
    });

    // write data to request body
    req.write('data\n');
    req.write('data\n');
    req.end();




};
