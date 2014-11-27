var winston = require('winston'),
    logs = require('../config.json').logs;
    
winston.emitErrs = true;

var logger = new winston.Logger({
    transports: [
        new winston.transports.File({
            level: logs.level,
            filename: logs.file,
            handleExceptions: true,
            json: logs.jsonFormat,
            maxsize: logs.maxSize,
            maxFiles: logs.maxFiles,
            colorize: logs.colorize
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};
 
