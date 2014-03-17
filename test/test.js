// Require chai.js expect module for assertions
//var expect = require('chai').expect;

var assert = require("assert")
describe('Array', function(){
  describe('#indexOf()', function(){
    it('should return -1 when the value is not present', function(){
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    })
  })
})


describe("JSON", function() {
    describe(".parse()", function() {
        it("should detect malformed JSON strings", function(){
            //Test Goes Here
        });
    });
});
