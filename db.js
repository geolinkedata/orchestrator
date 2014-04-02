var pg = require('pg'),
    config = require('./config.json').db,
    configSemanticDb = require('./config.json').strabonSemanticDb,
    auth = {},
    user = {},
    semantic = {};



/**
 * Description
 * @method errFetching
 * @param {} err
 * @return CallExpression
 */
var errFetching = function(err){
    return console.error('error fetching client from pool', err);
};

/**
 * Description
 * @method errQuery
 * @param {} err
 * @return CallExpression
 */
var errQuery = function (err){
    return console.error('error running query', err);
};


/**
 * checks if a token is stored in the db.
 * @method checkToken
 * @param {} token
 * @param {} callback
 * @return
 */
auth.checkToken = function(token, callback){
    pg.connect(config.connString, function(err, client, done){
        if (err){
            return errFetching(err);
        }
        var q = 'SELECT user_id FROM '+config.tokenTable+' WHERE key=\''+token+'\'';

        client.query(q, function(err, res){
            done();
            if (err){
                return errQuery(err);
            }
            if (res.rows.length > 0){
                callback(null, res.rows[0]);}
            else
                callback(null,false);
        });
    });
};


/**
 * Deletes a token
 * @method deleteToken
 * @param {} t token to be deleted.
 * @param {} callback
 * @return
 */
auth.deleteToken = function(t, callback){
    pg.connect(config.connString, function(err, client, done){
        if (err){
            return errFetching(err);
        }
        var q = 'DELETE FROM '+config.tokenTable+' WHERE key=\''+t+'\'';
        client.query(q, function(err, res){
            done();
            if (err){
                return errFetching(err);
            }
            else
                callback(null, true);
        });
    });
};


/**
 * Inserts task load data in db.
 * @method loadData
 * @param {} user
 * @param {} message
 * @param {} dataLoaded
 * @param {} callback
 * @return
 */
user.loadData = function(user, message, dataLoaded, callback){
    pg.connect(config.connString, function(err, client, done){
        if (err){
            return errFetching(err);
        }
        var q ='INSERT INTO '+config.dataLoadedTable+'(user_id, message, loaded, created) VALUES(\''+
            user+"','"+message+"','"+dataLoaded+"',now())";
        client.query(q, function(err, res){
            done();
            if (err){
                return errFetching(err);
            }
            else
                callback(null);
        });

    });
};


/**
 * Retrieves user email.
 * @method getEmailAddress
 * @param {} user
 * @param {} callback
 * @return
 */
user.getEmailAddress = function(user, callback){
    pg.connect(config.connString, function(err, client, done){
        if (err){
            return errFetching(err);
        }
        user = 1;
        var q = 'SELECT email FROM '+config.emailAddressTable+' where user_id=\''+user+'\' AND verified=\'true\'';
        client.query(q, function(err, res){
            done();
            if (err){
                return errFetching(err);
            }
            else{
                callback(null, res.rows[0]);
            }
        });
    });
};


/**
 * Deletes strabon lock table if exists.
 * @method dropLockTable
 * @param {} callback
 * @return
 */
semantic.dropLockTable = function(callback){
    pg.connect(configSemanticDb.connString, function(err, client, done){
        if (err){
            return errFetching(err);
        }
        var q = 'DROP TABLE IF EXISTS '+configSemanticDb.lockTable;
        client.query(q, function(err, res){
            done();
            if (err){
                return errFetching(err);
            }
            else
                callback(null);
        });
    });
};



exports.auth = auth;
exports.semantic = semantic;
exports.user = user;
