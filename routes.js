var router = require('router'),
    route = router(),
    db = require('./db'),
    tasks = require('./tasks');


var getToken = function(str, callback){
    if (str && typeof str === 'string'){
        var token = str.replace('Token ', '');
        callback(null, token);
    }
    else{
        console.log('authorization missing');
        callback(null, false);
    }
};


route.post('/loadShape', function(req, res){
    getToken(req.headers.authorization, function(err, token){
        if (token !== false){
            db.auth.checkToken(token, function(err, result){
                if (result !== false){
                    var b='';
                    req.on('data', function(data){
                        b+=data;
                    });
                    req.on('end', function(){
                        var job = {
                            params: b,
                            token: token,
                            user: result.user_id,
                            sendEmail: true
                        };
                        tasks.handler(job);
                    });
                    res.writeHead(200);
                    res.end('');
                }
                else{
                    console.log('token not found!');
                }
            });
        }/*
        else{
            console.log('authorization missing!');
        }*/
    });
});


route.post('/loadTripleStore', function(req, res){
    getToken(req.headers.authorization, function(err, token){
        if (token!==false){
            console.log('store in db');
        }
    });
});


exports.route = route;
