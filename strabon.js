var sys = require('sys'),
    exec = require('child_process').exec,
    config = require('./config.json').strabon,
    jps = require('./config.json').jps;



/**
 * Stores a triple store file data in semantic db using strabon.
 * @method storeInSemanticDb
 * @param {} file a triple store format file.
 * @param {} callback
 * @return
 */
exports.storeInSemanticDb = function(file, callback){
    //TODO:: change -f format where file type is not n3!
    var cmd = config.path+' -MM 3 -db endpoint -u postgres -pass postgres store -f N3 '+file;
    console.log(cmd);
    exec(cmd, function(err, stdout, stderr){

        console.log('stderr: ' + stderr);
        if (err !== null) {
            console.log('exec error: ' + err);
        }
        if (stdout === 'STORED\n'){
            callback(null, true);
        }
        else{
            callback(null, false);
        }
    });
};


/**
 * Checks if strabon is running using jps (java process status tool).
 * @method checkRunning
 * @param {} callback
 * @return
 */
exports.checkRunning = function(callback){
    exec(jps, function(err, stdout, stderr){
      if (err !== null) {
            console.log('exec error: ' + err);
        }
        if (stdout.indexOf(config.storeCmd) !== -1){
            callback(null, true);
        }
        callback(null, false);
    });
};
