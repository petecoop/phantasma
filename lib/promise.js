var Promise = require("bluebird/js/main/promise")();

module.exports = Promise;

var phantasma = null;

Promise.prototype.phantasma = function (pa) {
  // TODO - fix this - should be within the object...
  phantasma = pa;
  return this;
};

// methods to run after previous promise has resolved
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

// methods to run immediately
['on', 'once'].forEach(function (method) {
  Promise.prototype[method] = function () {
    var args = [].slice.call(arguments);
    return phantasma[method].apply(phantasma, args);
  };
});