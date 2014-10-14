var config = require('./config.json').virtuoso.isql,
    isql = require('virtuoso-isql-wrapper'),
    http = require('http'),
    cli = new isql.Client({
        port: config.port,
        user: config.user,
        pwd: config.pwd,
	command: 'isql-v'
    });

/**
 * Checks if virtuoso db is running.
 * @method checkRunning
 * @param {} callback
 * @return
 */
exports.checkRunning = function(callback){

    var virtuosoConnection = {
        host: config.host,
        port: config.port,
        path: '/',
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
            callback(true, true);
    });

    req.end();
};

/**
 * Stores a triple store file data in virtuoso db.
 * @method storeInSemanticDb
 * @param {} file path.
 * @param {} file name.
 * @param {} graph name.
 * @param {} callback
 * @return
 */
exports.storeInSemanticDb = function(path, file, graph, callback){
    var fn = "ld_dir('"+path+"', '"+file+"', '"+graph+"');";
    cli.exec(fn, function(err, res) {
        cli.exec('rdf_loader_run();', function(err, res){
            callback(null, true);
        });
    });
};

/**
 * deletes a graph from virtuoso db.
 * @method clearGraph
 * @param {} graph name.
 * @param {} callback
 * @return
 */
exports.clearGraph = function(graph, callback){
    var fn = 'SPARQL CLEAR GRAPH <'+graph+'> ;';
    fn+="DELETE FROM DB.DBA.load_list WHERE ll_graph='"+graph+"';";

    cli.exec(fn, function(err, res){
        callback(null, true);
    });
};
