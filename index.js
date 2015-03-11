var Promise = require('./lib/promise');
var phantom = require('phantom');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var defaults = require('defaults');
var changeCase = require('change-case');

var OPTIONS = {
  params: [
    'diskCache',
    'ignoreSslErrors',
    'localStoragePath',
    'localToRemoteUrlAccess',
    'maxDiskCacheSize',
    'proxy',
    'proxyType',
    'proxyAuth',
    'sslCertificatesPath',
    'webSecurity'
  ],
  options: [
    'phantomPath',
    'port'
  ],
  extras: [
    'timeout'
  ]
};

var DEFAULTS = {
  diskCache: false,
  ignoreSslErrors: true,
  loadImages: true,
  localStoragePath: null,
  localToRemoteUrlAccess: false,
  maxDiskCacheSize: null,
  phantomPath: null,
  port: null,
  proxy: null,
  proxyType: 'http',
  proxyAuth: null,
  sslCertificatesPath: null,
  timeout: 5000,
  webSecurity: true
};
 
module.exports = Phantasma = function (options) {
  EventEmitter.call(this);
  this.ph = null;
  this.page = null;
  this.promise = Promise(this);
  this.options = defaults(options, DEFAULTS);
  return this.init();
};

util.inherits(Phantasma, EventEmitter);

Phantasma.prototype.init = function () {
  var self = this;

  var options = {parameters: {}};
  for(var o in this.options){
    if(this.options[o] !== null){
      if(OPTIONS.params.indexOf(o) !== -1){
        options.parameters[changeCase.paramCase(o)] = this.options[o];
      }
      if(OPTIONS.options.indexOf(o) !== -1){
        options[o] = this.options[o];
      }
    }
  }

  return new this.promise(function (resolve, reject) {
    phantom.create(function (ph) {
      self.ph = ph;
      ph.createPage(function (page) {
        self.page = page;
        page.set('onUrlChanged', function (url) {
          self.emit('onUrlChanged', url);
        });
        page.set('onResourceRequested', function (requestData, networkRequest) {
          self.emit('onResourceRequested', requestData, networkRequest);
        });
        page.set('onResourceReceived', function (response) {
          self.emit('onResourceReceived', response);
        });
        page.set('onLoadStarted', function () {
          self.emit('onLoadStarted');
        });
        page.set('onLoadFinished', function (status) {
          self.emit('onLoadFinished', status);
        });
        page.set('onAlert', function (msg) {
          self.emit('onAlert', msg);
        });
        page.set('onError', function (msg, trace) {
          self.emit('onError', msg, trace);
        });
        page.set('onNavigationRequested', function (url, type, willNavigate, main) {
          self.emit('onNavigationRequested', url, type, willNavigate, main);
        });
        resolve();
      });
    }, options);
  });

};

Phantasma.prototype.open = function (url) {
  var self = this;

  return new this.promise(function (resolve, reject) {
    if(!self.page) return reject('tried to open before page created');

    self.page.open(url, function (status) {
      resolve(status);
    });
  }).timeout(this.options.timeout);
};

Phantasma.prototype.exit = function () {
  var self = this;

  return new this.promise(function (resolve, reject) {
    self.ph.exit();
    resolve();
  });
};

Phantasma.prototype.viewport = function (width, height) {
  var self = this;

  return new this.promise(function (resolve, reject) {
    if(!self.page) return reject('tried to set viewport before page created');
    page.set('viewportSize', {width: width, height: height}, function (result) {
      resolve(result);
    });
  });
};

Phantasma.prototype.wait = function () {
  var self = this;

  return new this.promise(function (resolve, reject) {
    self.once('onLoadFinished', function (status) {
      resolve(status);
    });
  }).timeout(this.options.timeout);
};

Phantasma.prototype.screenshot = function (path) {
  var self = this;

  return new this.promise(function (resolve, reject) {
    self.page.render(path, resolve);
  });
};

Phantasma.prototype.evaluate = function (fn) {
  var self = this;

  var args = [].slice.call(arguments);
  return new this.promise(function (resolve, reject) {
    if(!self.page) return reject('tried to evaluate before page created');
    args = [fn, resolve].concat(args.slice(1));
    self.page.evaluate.apply(null, args);
  });
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

Phantasma.prototype.url = function () {
  return this.evaluate(function () {
    return document.location.href;
  });
};

Phantasma.prototype.forward = function () {
  var self = this;

  return new this.promise(function (resolve, reject) {
    self.page.goForward();
    resolve();
  }).wait();
};

Phantasma.prototype.back = function () {
  var self = this;

  return new this.promise(function (resolve, reject) {
    self.page.goBack();
    resolve();
  }).wait();
};

Phantasma.prototype.refresh = function () {
  var self = this;

  return new this.promise(function (resolve, reject) {
    self.page.reload();
    resolve();
  }).wait();
};