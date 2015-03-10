var Phantasma = require('../index');
var should = require('should');

describe('Phantasma', function () {

  it('should be constructable', function () {
    var ph = new Phantasma();
    ph.should.be.ok;
    ph.exit();
  });

  describe('Methods', function () {
    
    it('should open page', function (done) {
      new Phantasma()
        .open('https://petecoop.co.uk')
        .exit()
    });

  });  

});