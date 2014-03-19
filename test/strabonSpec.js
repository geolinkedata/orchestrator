var expect = require('chai').expect,
    strabon = require('../strabon');


describe('Strabon', function(){
    describe('checkRunning', function(){
        it('should verify that Strabon (StoreOp) is running', function(done){
            strabon.checkRunning(function(err, res){
                expect(err).to.be.null;
                expect(res).to.be.a('boolean');
                done();
            });
        });
    });/*
    describe('storeInSemanticDb', function(){
        it('should store a triple-store format file in semantic db',function(done){
            this.timeout(45000);
            //example file
            var exampleFile = __dirname+'/example.nt';
            strabon.storeInSemanticDb(exampleFile, function(err, res){
                expect(err).to.be.null;
                expect(res).to.be.true;
                //TODO:: delete example data from db!
                done();
            });
           });
    });*/
});
