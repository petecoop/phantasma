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
  page: [
    'javascriptEnabled',
    'loadImages',
    'localToRemoteUrlAccessEnabled',
    'userAgent',
    'userName',
    'password',
    'XSSAuditingEnabled',
    'webSecurityEnabled',
    'resourceTimeout'
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
  webSecurity: true,
  javascriptEnabled: null,
  loadImages: null,
  localToRemoteUrlAccessEnabled: null,
  userAgent: null,
  userName: null,
  password: null,
  XSSAuditingEnabled: null,
  webSecurityEnabled: null,
  resourceTimeout: null,
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
  var pageOptions = {};
  for(var o in this.options){
    if(this.options[o] !== null){
      if(OPTIONS.params.indexOf(o) !== -1){
        options.parameters[changeCase.paramCase(o)] = this.options[o];
      }
      if(OPTIONS.options.indexOf(o) !== -1){
        options[o] = this.options[o];
      }
      if(OPTIONS.page.indexOf(o) !== -1){
        pageOptions[o] = this.options[o];
      }
    }
  }

  return new this.promise(function (resolve, reject) {
    phantom.create(function (ph) {
      self.ph = ph;
      ph.createPage(function (page) {
        self.page = page;
        // map phantom callback to signals
        page.set('onAlert', function (msg) {
          self.emit('onAlert', msg);
        });
        page.set('onConsoleMessage', function (msg, lineNum, sourceId) {
          self.emit('onConsoleMessage', msg, lineNum, sourceId);
        });
        page.set('onError', function (msg, trace) {
          self.emit('onError', msg, trace);
        });
        page.set('onLoadFinished', function (status) {
          self.emit('onLoadFinished', status);
        });
        page.set('onLoadStarted', function () {
          self.emit('onLoadStarted');
        });
        page.set('onNavigationRequested', function (url, type, willNavigate, main) {
          self.emit('onNavigationRequested', url, type, willNavigate, main);
        });
        page.set('onResourceReceived', function (response) {
          self.emit('onResourceReceived', response);
        });
        page.set('onResourceRequested', function (requestData, networkRequest) {
          self.emit('onResourceRequested', requestData, networkRequest);
        });
        page.set('onResourceTimeout', function (request) {
          self.emit('onResourceTimeout', request);
        });
        page.set('onUrlChanged', function (url) {
          self.emit('onUrlChanged', url);
        });

        if(Object.keys(pageOptions).length){
          var settings = [];
          for(var o in pageOptions){
            settings.push(self.pageSetting(o, pageOptions[o]));
          }
          self.promise.all(settings).then(function () {
            resolve();
          });
        }else{
          resolve();
        }

      });
    }, options);
  });

};

Phantasma.prototype.pageSetting = function (setting, value) {
  var self = this;

  return new this.promise(function (resolve, reject) {
    self.page.set('settings.' + setting, value, resolve);
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

  return this.focus(selector)
    .then(function () {
      return self.page.sendEvent('keypress', value);
    }).delay(50);
};

Phantasma.prototype.value = function (selector, value) {
  var self = this;

  return this.evaluate(function (selector, value) {
    document.querySelector(selector).value = value;
  }, selector, value);
};

Phantasma.prototype.select = function (selector, value) {
  var self = this;

  return this.evaluate(function (selector, value) {
    var element = document.querySelector(selector);
    var evt = document.createEvent('HTMLEvents');
    element.value = value;
    evt.initEvent('change', true, true);
    element.dispatchEvent(evt);
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

Phantasma.prototype.focus = function (selector) {
  var self = this;

  return this.evaluate(function (selector) {
    document.querySelector(selector).focus();
  }, selector);
};

Phantasma.prototype.injectJs = function (path) {
  var self = this;

  return new this.promise(function (resolve, reject) {
    self.page.injectJs(path, function (status) {
      resolve(status);
    });
  });
};

Phantasma.prototype.injectCss = function (style) {
  var self = this;

  return this.evaluate(function (style) {
    var ele = document.createElement('style');
    ele.innerHTML = style;
    document.head.appendChild(ele);
  }, style);
};

Phantasma.prototype.content = function (html) {
  var self = this;

  return new this.promise(function (resolve, reject) {
    if(html){
      self.page.setContent(html, null, resolve);
    }else{
      self.page.getContent(function (content) {
        resolve(content);
      });
    }
  });
};

exports.extractDomElement = function (selector, path) {
    var self = this;
    this.page.evaluate(function (selector) {
        return document.querySelector(selector).getBoundingClientRect();
    }, function (rectOptions) {
        self.page.set('clipRect', rectOptions);
        self.page.render(path);
    }, selector);
};

