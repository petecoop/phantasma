var Promise = require("bluebird/js/main/promise")();

module.exports = Promise;

var phantasma = null;

Promise.prototype.phantasma = function (pa) {
  phantasma = pa;
  return this;
};

[
  'open',
  'exit',
  'wait',
  'screenshot',
  'evaluate',
  'type',
  'click',
  'title'
].forEach(function (method) {
  Promise.prototype[method] = function () {
    var args = [].slice.call(arguments);
    return this.then(function () {
      return phantasma[method].apply(phantasma, args);
    });
  };
});