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
        path: config.path+params,
        method: 'POST'
    };
    var arrParams = qs.parse(params);
    var req = http.request(tgeo, function(res){

        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');

        //doesn't works without on data event!!!
        res.on('data', function(chunk){
            console.log(chunk);
        });

        res.on('end', function(){
            //move resulting triple store file
            var resFile=config.defaultResultFile+arrParams.outputFile.substring(
                arrParams.outputFile.lastIndexOf('.'));


            //move triple-store file created by triplegeo
            var is = fs.createReadStream(resFile);
            var os = fs.createWriteStream(arrParams.outputFile);
            is.pipe(os);
            is.on('end', function(){
                fs.unlink(resFile, function(err){
                    if(err){
                        return;
                    }
                    callback(null, arrParams.outputFile);
                });
            });
        });

    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write('data\n');
    req.write('data\n');
    req.end();
};
