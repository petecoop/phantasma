var promise = require("bluebird/js/main/promise");

module.exports = function (pa) {

  var Promise = promise();
  var phantasma = pa;

  // methods to run after previous promise has resolved
  [
    'open',
    'exit',
    'wait',
    'viewport',
    'screenshot',
    'evaluate',
    'type',
    'value',
    'select',
    'click',
    'title',
    'url',
    'forward',
    'back',
    'refresh',
    'focus',
    'injectJs',
    'injectCss',
    'content',
    'pageSetting',
    'screenshotDomElement'
  ].forEach(function (method) {
    Promise.prototype[method] = function () {
      var self = this;
      var args = [].slice.call(arguments);
      return this.then(function () {
        return phantasma[method].apply(phantasma, args);
      });
    };
  });

  // methods to run immediately
  ['on', 'once', 'getPid', 'removeListener'].forEach(function (method) {
    Promise.prototype[method] = function () {
      var args = [].slice.call(arguments);
      return phantasma[method].apply(phantasma, args);
    };
  });

  return Promise;

};
