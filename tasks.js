var jobs = [],
    tgeo = require('./tgeo'),
    //strabon = require('./strabon'),
    virtuoso = require('./virtuoso'),
    db = require('./db'),
    nodemailer = require('nodemailer'),
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
                    console.log('Error occured during email sending.');
                    console.log(error.message);
                    return;
                }
                console.log('Message sent successfully!');
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
	var res={};
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
	callback(null, res);
      }
    }  
  });
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
      var pos = filePath.lastIndexOf('/');
      var fileName = filePath.substring(pos + 1);
      var pos1 =  fileName.lastIndexOf('.');
      fileName = fileName.substring(0, pos1);
       res.fileName = fileName;
       callback(err, res);
    });
  }
  else
  {
    //console.log('LOAD'+ job.loadInGeonode);
    virtuoso.checkRunning( function(err, running){
      if (running)
      {
	tgeo.convertShape(job.params, function(tripleStoreFile){
	  var pos =  job.params.indexOf('outputFile=');
 	  var path=job.params.substr(pos+11);
	  path = path.substring(0, path.indexOf('&'));
	  path = path.replace(/%2F/g, '/');
	  var pos1 = path.lastIndexOf('/');
	  var dirPath= path.substring(0, pos1);
	  var name=path.substring( pos1+1);
	  //TODO:: impostare il graph via API?
	  var graph= 'NULL';
	    virtuoso.storeInSemanticDb(dirPath, name, graph, function(){
	      console.log(tripleStoreFile);
	      callback();
	  });
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
		    console.log('triple store file stored in semantic db');
	      callback();
	    });	
	}
	else
	{
	  callback();
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
 
      if (job.shp){  //shape file
	  execute(job, callback);
        /*execute(job, function(){
           return;
        });*/
      }
      else{ //triple store
	loadTripleStore(job, function(){
	   return;
	});
      }
      return;
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
