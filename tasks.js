var jobs = [],
    tgeo = require('./tgeo'),
    //strabon = require('./strabon'),
    virtuoso = require('./virtuoso'),
    db = require('./db'),
    nodemailer = require('nodemailer'),
    logger = require('./utils/logger'),
    emailConfig = require('./config.json').email;


/**
 * Sends an email
 * @method sendEmail
 * @param {} user
 * @param {} msg
 * @param {} loaded
 * @param {} callback
 * @return
 */
var sendEmail = function(user, msg, loaded, callback){
    db.user.getEmailAddress(user, function(err, res){
        var msg = emailConfig.textOk;
        if (loaded === false){
            msg = emailConfig.textFailed;
        }
        if (res){
            var transport = nodemailer.createTransport('SMTP', emailConfig.transport);
            var message = {
                from: emailConfig.sender,
                to: res,
                subject: emailConfig.subject,
                text: msg
            };
            transport.sendMail(message, function(error){
                if(error){
                    logger.error('EMAIL: Error occured during email sending.');
                    logger.error('EMAIL: '+error.message);
                    return;
                }
                logger.info('EMAIL: Message sent successfully!');
            });
        }
    });
};

var loadShpInGeonode = function(pathFile, callback){
  var run_cmd = function(cmd, args, callBack ) {
    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args);
    var resp = '';
    child.stdout.on('data', function (buffer) { resp += buffer.toString() });
    child.stdout.on('end', function() { callBack (resp) });
  };

  run_cmd( 'geonode' , ['importlayers', pathFile], function(text) {  
    var lines = text.replace(/\r\n/g, '\n').split('\n');
    for (var i =0; i < lines.length; i++)
    {
      var pos=lines[i].indexOf(' Failed layers');
     
      if (pos !== -1)
      {
	var failedLayers=lines[i].substring(0, pos);
	
	/*var res={};
	if (failedLayers==='0')
	{
	  res.status=201;
	  res.detail='file stored in geonode db';
	  res.fileName = pathFile;
	}
	else
	{
	  res.status=500;
	  res.detail='error occured during storage in geonode database!';
	}
	callback(null, res);*/
      }
      else
      {
	callback({status: 500, detail: 'Error, importing in geonode db failed.'}, false);
      }
    }  
  });
};

var getPath =  function(params){
  var pos = params.indexOf('outputFile=');
  var path = params.substr(pos+11);  
  path = path.substring(0, path.indexOf('&'));
  path = path.replace(/%2F/g, '/');
  var pos1 = path.lastIndexOf('/');   
  
  return {
    dirPath: path.substring(0, pos1),
    name: path.substring( pos1+1)
  }  
};

/**
 * Run the task
 * @method execute
 * @param {} job
 * @return
 */
var execute = function(job, callback){  

  if (job.loadInGeonode)
  {
    var pos = job.params.indexOf('input_file=');
    var filePath = job.params.substring(pos+11);
    filePath = filePath.replace(/%2F/g, '/');
    loadShpInGeonode(filePath, function(err, res){
        if (err)
	  callback(err, false);
	else {
	  var pos = filePath.lastIndexOf('/');
	  var fileName = filePath.substring(pos + 1);
	  var pos1 =  fileName.lastIndexOf('.');
	  fileName = fileName.substring(0, pos1);
	  //res.fileName = fileName;	
	  callback(err, res);
	}
    });
  }
  else if (job.convertOnly)
  {
    tgeo.convertShape(job.params, function(tripleStoreFile){
       var path=getPath(job.params);
       //console.log(path);
       var graph= 'NULL';
    });
  }
  else
  {
    virtuoso.checkRunning( function(err, running){      
      if (running)
      {
	tgeo.convertShape(job.params, function(error, tripleStoreFile){	  
	  if (error)
	    callback(error, false);
	  else {
	    var path=getPath(job.params);

	    //TODO:: impostare il graph via API?
	    var graph= 'NULL';
	      virtuoso.storeInSemanticDb(path.dirPath, path.name, graph, function(){
		//console.log(tripleStoreFile);
		callback(false, false);
	    });
	  }   
	});
      }
      else
      {
	callback();
      }
    });
  }
};


/**
 * Run the task, loading triple store in database
 * @method loadTripleStore
 * @param {} job
 * @return
 */
var loadTripleStore = function(job, callback){
    virtuoso.checkRunning( function(err, running){
	if (running)
	{
	  var pos = job.params.indexOf('path=');
	  var path = job.params.substr(pos+5);
	  var dirPath = path.substring(pos, path.indexOf('&'));
	  dirPath = dirPath.replace(/%2F/g, '/');
	  
	  var name = path.substring(path.indexOf('filename=')+9);
	  
	  //TODO:: impostare il graph via API?
	  var graph= 'NULL';	  
	      virtuoso.storeInSemanticDb(dirPath, name, graph, function(){
		    logger.info('triple-store file saved in semantic db.');
	            callback(false, false);
	    });	
	}
	else
	{
	  callback(err, false);
	}
    });
};






/**
 * Handler tasks
 * @method handler
 * @param {} job
 * @param {} user
 * @return
 */
exports.handler = function(job, callback){
    if (jobs.length === 0){ //jobs array is empty

      if (job.shp || job.convertOnly){  //shape file
	  execute(job, callback);
        /*execute(job, function(){
           return;
        });*/
      }
      else{ //triple store
	loadTripleStore(job, callback);
      }
      //return;
    }
    else{ //adding job to queue array.
        jobs.push(job);
        return;
    }
};


/**
 * Periodic tasks
 * @method handler
 * @return
 */
exports.periodicHandler = function(){
    if (jobs.length > 0){
        execute(jobs[0], function(){
            jobs.shift(); //remove first executed job from queue array
        });
    }

};
