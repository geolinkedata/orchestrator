var expect = require('chai').expect,
    assert = require('chai').assert,
    fs = require('fs'),
    dataDir = require('../config.json').dirs.uploadShape,
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
            var path = '/tmp';
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
