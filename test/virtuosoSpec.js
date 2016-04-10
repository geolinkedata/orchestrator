var expect = require('chai').expect,
    assert = require('chai').assert,
    fs = require('fs'),
    config = require('../config.json').dirs,
    virtuoso = require('../virtuoso');

describe('Virtuoso', function(){
    describe('checkRunning', function(){
        it('should verify that Virtuoso Open Link is running', function(done){
            virtuoso.checkRunning(function(err, res){
                expect(err).to.be.a('boolean');
	        assert.isObject(res);	
                //expect(res).to.be.true;
                done();
            });
        });
    });
    describe('storeInSemanticDb', function(){
        it('should store and then delete a triple-store format file in virtuoso semantic db',function(done){
            this.timeout(5000);
            //example file
<<<<<<< HEAD
            //var path = '/tmp';
            var path = config.uploadShape;
=======
            var path = dataDir;
>>>>>>> 86deefe3f477dd1cb5fb8c8e7c441637c62936a0
            var exampleFile = 'example.nt';
            var exampleGraph = 'http://prova.com#';

            var tmpExampleFile = path+'/'+exampleFile;
            //copy example file to /tmp
            //move triple-store file created by triplegeo
            var is = fs.createReadStream(__dirname+'/'+exampleFile);
            var os = fs.createWriteStream(tmpExampleFile);
            is.pipe(os);
            is.on('end', function(){
                virtuoso.storeInSemanticDb(path, exampleFile, exampleGraph, function(err, res){
                    expect(err).to.be.null;
                    expect(res).to.be.true;
                    //delete example graph from db
                    virtuoso.clearGraph(exampleGraph, function(err, res){
                        expect(err).to.be.null;
                        expect(res).to.be.true;
                        //delete tmp example file
                        fs.unlink(tmpExampleFile, function(err){
                           expect(err).to.be.null;
                           done();
                        });
                    });
                });
            });
        });
    });
});
