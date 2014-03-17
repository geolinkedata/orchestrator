var jobs = [],
    tgeo = require('./tgeo'),
    strabon = require('./strabon'),
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
                    console.log('Error occured');
                    console.log(error.message);
                    return;
                }
                console.log('Message sent successfully!');
            });
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
    strabon.checkRunning( function(err, running){
        if (running === false){
            db.semantic.dropLockTable(function(){
                tgeo.convertShape(job.params, function(outputFile){
                    strabon.storeInSemanticDb(outputFile, function(){
                        db.auth.deleteToken(job.token, function(err, res){
                            var msg = 'msg';
                            var loaded = true;
                            db.user.loadData(job.user, msg,
                                               loaded, function(err, res){
                                                   if (job.sendEmail){
                                                       sendEmail(job.user, msg, loaded, function(){
                                                           console.log('email');
                                                           console.log('END');
                                                           callback();
                                                       });
                                                   }
                                                   else{
                                                       console.log('END');
                                                       callback();
                                                   }
                                               });
                        });
                    });
                });
            });
        }
        else{
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
exports.handler = function(job, user){
    if (jobs.length === 0){ //jobs array is empty
        execute(job, function(){
           return;
        });
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
