var Phantasma = require('../index');
var assert = require('assert');

describe('Phantasma', function () {
  it('should be constructable', function () {
    var ph = new Phantasma();
    assert(ph !== undefined);
  });
});