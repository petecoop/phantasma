var Promise = require('./lib/promise');
var phantom = require('phantom');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
 
module.exports = Phantasma = function () {
  EventEmitter.call(this);
  this.ph = null;
  this.page = null;
  return this.init();
};

util.inherits(Phantasma, EventEmitter);

Phantasma.prototype.init = function () {
  var self = this;

  return new Promise(function (resolve, reject) {
    phantom.create(function (ph) {
      self.ph = ph;
      ph.createPage(function (page) {
        self.page = page;
        page.set('onUrlChanged', function (url) {
          self.emit('onUrlChanged', url);
        });
        page.set('onResourceRequested', function () {
          self.emit('onResourceRequested');
        });
        page.set('onResourceReceived', function (res) {
          self.emit('onResourceReceived', res);
        });
        page.set('onLoadStarted', function () {
          self.emit('onLoadStarted');
        });
        page.set('onLoadFinished', function (status) {
          self.emit('onLoadFinished', status);
        });
        resolve();
      });
    });
  }).phantasma(self);

};

Phantasma.prototype.open = function (url) {
  var self = this;

  return new Promise(function (resolve, reject) {
    if(!self.page) return reject('tried to open before page created');

    self.page.open(url, function (status) {
      resolve(status);
    });
  }).phantasma(self);
};

Phantasma.prototype.exit = function () {
  this.ph.exit();
};

Phantasma.prototype.viewport = function (width, height) {
  var self = this;

  return new Promise(function (resolve, reject) {
    if(!self.page) return reject('tried to set viewport before page created');
    page.set('viewportSize', {width: width, height: height}, function (result) {
      resolve(result);
    });
  }).phantasma(self);
};

Phantasma.prototype.wait = function () {
  var self = this;

  return new Promise(function (resolve, reject) {
    self.once('onLoadFinished', function (status) {
      resolve(status);
    });
  }).phantasma(self);
};

Phantasma.prototype.screenshot = function (path) {
  var self = this;

  return new Promise(function (resolve, reject) {
    self.page.render(path, resolve);
  }).phantasma(self);
};

Phantasma.prototype.evaluate = function (fn) {
  var self = this;

  var args = [].slice.call(arguments);
  return new Promise(function (resolve, reject) {
    if(!self.page) return reject('tried to evaluate before page created');
    args = [fn, resolve].concat(args.slice(1));
    self.page.evaluate.apply(null, args);
  }).phantasma(self);
};

Phantasma.prototype.type = function (selector, value) {
  var self = this;

  return this.evaluate(function (selector, value) {
    document.querySelector(selector).value = value;
  }, selector, value);
};

Phantasma.prototype.click = function (selector) {
  var self = this;

  return this.evaluate(function (selector) {
    var evt = document.createEvent('MouseEvent');
    evt.initEvent('click', true, true);
    var ele = document.querySelector(selector);
    ele.dispatchEvent(evt);
  }, selector);
};

Phantasma.prototype.title = function () {
  return this.evaluate(function () {
    return document.title;
  });
};