var expect = require('chai').expect,
    qs = require('querystring'),
    fs = require('fs'),
    tgeo = require('../tgeo');


describe('Tgeo', function(){
    describe('convertShape', function(){
        it('should convert a shape file in a triple store format file', function(done){
            this.timeout(5000);
            var arrParams={attribute: "osm_id",
                           class: "type",
                           defaultLang: "en",
                           format: "N-TRIPLES",
                           featureString: "points",
                           ignore: "UNK",
                           inputFile: __dirname+"/points.shp",
                           job: "file",
                           name: "point",
                           nsPrefix: "",
                           nsURI: "http://www.opengis.net/ont/geosparql",
                           ontologyNS: "http://www.opengis.net/ont/geosparql",
                           ontologyNSPrefix: "geo",
                           outputFile: __dirname+"/points.nt",
                           sourceRS: "",
                           targetRS: "",
                           targetStore: "GeoSparql",
                           type: "point"
                          };
            var params=qs.stringify(arrParams);
            tgeo.convertShape(params, function(err, res){
                expect(err).to.be.null;
                fs.exists(res, function(exists){
                    if (exists){
                        //delete res file
                        fs.unlink(res, function(err){
                            if (err){
                                return;
                            }
                            done();
                        });
                    }
                });
            });
        });
    });
});
