var http = require('http'),
    qs = require('querystring'),
    fs = require('fs'),
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
    //console.log(arrParams);

    var stats = fs.statSync(arrParams.inputFile);
    //console.log('inputFILE STATS'+arrParams.inputFile+' :  '+stats.size);

    var req = http.request(tgeo, function(res){
 
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');

        //doesn't works without on data event!!!
        res.on('data', function(chunk){
            //console.log('ondata');
            console.log(chunk);
        });

        res.on('end', function(){
            //console.log('onend');
            //move resulting triple store file
            var resFile=config.defaultResultFile+arrParams.outputFile.substring(
                arrParams.outputFile.lastIndexOf('.'));

            //move triple-store file created by triplegeo
            var is = fs.createReadStream(resFile);
	    is.on('error', function(err){
	      callback({status: 500, detail: 'Error, triple store resource not created!'}, false);
	      console.log('ERROR, triple store resource not created!');
	    });	    
	    is.on('open', function(){
	      var os = fs.createWriteStream(arrParams.outputFile);
	      is.pipe(os);	      
	    });
            is.on('end', function(){
                fs.unlink(resFile, function(err){
                    if(err){
		      callback({status: 500, detail: 'Internal server error.'}, false);
                    }
                    callback(false, arrParams.outputFile);
                });
            });
        });

        res.on('error', function(){	   
            console.log('ERROR.');
	    callback(true, false);
        });

    });

    req.on('error', function(e) {      
        console.log('problem with request: ' + e.message);
	callback(true, false);
    });

    // write data to request body
    req.write('data\n');
    req.write('data\n');
    req.end();




};
