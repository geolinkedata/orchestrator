var expect = require('chai').expect,
    fs = require('fs'),
    virtuoso = require('../virtuoso');

describe('Virtuoso', function(){
    describe('checkRunning', function(){
        it('should verify that Virtuoso Open Link is running', function(done){
            virtuoso.checkRunning(function(err, res){
                expect(err).to.be.a('boolean');
                expect(res).to.be.a('boolean');
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

            //copy example file to /tmp
            //move triple-store file created by triplegeo
            var is = fs.createReadStream(__dirname+'/'+exampleFile);
            var os = fs.createWriteStream(path+'/'+exampleFile);
            is.pipe(os);
            is.on('end', function(){
                virtuoso.storeInSemanticDb(path, exampleFile, exampleGraph, function(err, res){
                    expect(err).to.be.null;
                    expect(res).to.be.true;
                    //TODO:: delete example file from /tmp!
                    //delete example graph from db
                    virtuoso.clearGraph(exampleGraph, function(err, res){
                        expect(err).to.be.null;
                        expect(res).to.be.true;
                        done();
                    });
                    done();
                });
            });
        });
    });
});
