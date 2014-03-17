var router = require('router'),
    route = router(),
    db = require('./db'),
    tasks = require('./tasks');


route.post('/', function(req, res){
    if (req.headers.authorization && typeof req.headers.authorization === 'string'){
        var token = req.headers.authorization.replace('Token ', '');
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
    }
    else{
        console.log('authorization missing!');
    }

});



exports.route = route;
