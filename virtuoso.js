var config = require('./config.json').virtuoso.isql,
    isql = require('virtuoso-isql-wrapper'),
    http = require('http');

exports.checkRunning = function(callback){

    var virtuosoConnection = {
        host: config.host,
        port: config.port,
        path: '',
        method: 'GET'
    };

    var req = http.request(virtuosoConnection, function(res){
        res.on('data', function(c){
           ;
        });

        res.on('end', function(){
            callback(false, true);
        });
    });

    req.on('error', function(e){
        if (e.code === 'ECONNREFUSED')
            callback(false, false);
        else
            callback(true, false);
    });

    req.end();
};


exports.storeInSemanticDb = function(path, file, graph, callback){
    var cli = new isql.Client({
        port: config.port,
        user: config.user,
        pwd: config.pwd
    });

    var fn = "ld_dir('"+path+"', '"+file+"', '"+graph+"');";
    cli.exec(fn, function(err, res) {
        cli.exec('rdf_loader_run();', function(err, res){
            callback(null, true);
        });
    });

};