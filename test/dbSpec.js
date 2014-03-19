var expect = require('chai').expect,
    should = require('chai').should,
    pg = require('pg'),
    db = require('../db.js'),
    configDb = require('../config.json').db;


//inserts a token in db
var insertTokenInDb = function(token, userId, callback){
    pg.connect(configDb.connString, function(err, client, done){
        if (err){
            return ;
        }
        var q = 'INSERT INTO '+configDb.tokenTable+
                "(key, user_id, created)VALUES('"+token+"', '"+userId+"', now())";
        client.query(q, function(err, res){
            if (err){
                return;
            }
            done();
            callback(null);
        });
    });
};

var deleteFakeData = function(userId, message, loaded, callback){
    pg.connect(configDb.connString, function(err, client, done){
        var q = "DELETE FROM "+configDb.dataLoadedTable+" WHERE user_id='"+userId+
                "' AND message='"+message+"' AND loaded='"+loaded+"'";
        client.query(q, function(err, res){
            if (err){
                return;
            }
            done();
            callback(null);
        });
    });
};



describe('DB', function(){
    describe('auth', function(){
        describe('checkToken', function(){
            it('should get a token from db', function(done){
                //fake token
                var token = 'qwertyuiop1234567890';
                var userId = 1;
                insertTokenInDb(token, userId, function(err){
                    expect(err).to.be.null;
                    //check token
                    db.auth.checkToken(token, function(err, res){
                        expect(err).to.be.null;
                        expect(res).to.have.a.property('user_id');
                        if (res.user_id === userId)
                            done();
                    });
                });
            });
        });
        describe('deleteToken', function(){
            it('should delete a token from db', function(done){
                //fake token
                var token='qwertyuiop1234567890';
                db.auth.deleteToken(token, function(err, res){
                    expect(err).to.be.null;
                    expect(res).to.be.true;
                    done();
                });
            });
        });
    });

    describe('user', function(){
        describe('loadData', function(){
            it('should load data in db', function(done){
                //fake data
                var userId=1;
                var msg='fake';
                var loaded=true;
                db.user.loadData(userId, msg, loaded, function(err){
                    expect(err).to.be.null;
                    deleteFakeData(userId, msg, loaded, function(err){
                        expect(err).to.be.null;
                        done();
                    });
                });
            });
        });
        describe('getEmailAddress', function(){
            it ('should retrieve an email address from db', function(done){
                var userId=1;
                db.user.getEmailAddress(userId, function(err, res){
                    expect(err).to.be.null;
                    expect(res).to.have.a.property('email');
                    done();
                });
            });
        });
    });

    describe('semantic', function(){
        describe('dropLockTable', function(){
            it('should delete the lock table', function(done){
                db.semantic.dropLockTable(function(err){
                    expect(err).to.be.null;
                    done();
                });

            });
        });
    });
});
