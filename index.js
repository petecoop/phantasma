var Promise = require('bluebird');
var phantom = require('phantom');
 
module.exports = Phantasma = function () {

  this.ph = null;
  this.page = null;
  
};

Phantasma.prototype.go = function (url) {
  console.log('go', url);
  var self = this;
  if(this.ph && this.page){
    return this.open(url);
  }else{
    return this.init()
      .then(function () {
        return self.open(url);
      });
  }
};

Phantasma.prototype.init = function () {
  var self = this;

  return new Promise(function (resolve, reject) {
    phantom.create(function (ph) {
      self.ph = ph;
      ph.createPage(function (page) {
        self.page = page;
        resolve();
      });
    });
  });

};

Phantasma.prototype.open = function (url) {
  var self = this;

  return new Promise(function (resolve, reject) {
    if(!self.page) return reject('tried to open before page created');

    self.page.open(url, function (status) {
      resolve(status);
    });
  });
};

Phantasma.prototype.exit = function () {
  console.log('exit');
  this.ph.exit();
};

Phantasma.prototype.evaluate = function (fn) {
  var self = this;
  return new Promise(function (resolve, reject) {
    self.page.evaluate(fn, resolve);
  });
};