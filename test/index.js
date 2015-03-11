var Phantasma = require('../index');
var should = require('should');
var fs = require('fs');
var rimraf = require('rimraf');
var http = require('http');
var serveStatic = require('serve-static');
var finalhandler = require('finalhandler');

describe('Phantasma', function () {

  var server, ph;

  before(function (done) {

    var serve = serveStatic('./test/files');
    server = http.createServer(function(req, res){
      var d = finalhandler(req, res);
      serve(req, res, d);
    });
    server.listen(3000, function () {
      done();
    });
  });

  after(function (done) {
    ph.exit();
    server.close(function () {
      rimraf('test/temp', done);
    });
  });

  beforeEach(function () {
    ph = new Phantasma();
  });

  afterEach(function () {
    ph.exit();
  });

  it('should be constructable', function () {
    ph.should.be.ok;
  });

  describe('Methods', function () {
    
    it('should open page', function () {
      return ph.open('http://localhost:3000')
        .then(function (status) {
          status.should.equal('success');
        });
    });
    
    it('should get the page title', function () {
      return ph.open('http://localhost:3000')
        .title()
        .then(function (title) {
          title.should.equal('Test');
        });
    });

    it('should follow a link', function () {
      return ph.open('http://localhost:3000')
        .click('#link')
        .wait()
        .url()
        .then(function (url) {
          url.should.equal('http://localhost:3000/page1.html');
        });
    });

    it('should enter text', function () {
      return ph.open('http://localhost:3000')
        .type('#typehere', 'test value')
        .evaluate(function () {
          return document.querySelector('#typehere').value;
        })
        .then(function (val) {
          val.should.equal('test value');
        });
    });

    it('should set value', function () {
      return ph.open('http://localhost:3000')
        .value('#typehere', 'test value')
        .evaluate(function () {
          return document.querySelector('#typehere').value;
        })
        .then(function (val) {
          val.should.equal('test value');
        });
    });

    it('should select a value', function () {
      return ph.open('http://localhost:3000')
        .select('#selectthis', '2')
        .evaluate(function () {
          return document.querySelector('#selectthis').value;
        })
        .then(function (val) {
          val.should.equal('2');
        });
    });

    it('should take screenshots', function () {
      var path = 'test/temp/screenshot.png';
      return ph.open('http://localhost:3000')
        .screenshot(path)
        .then(function () {
          fs.existsSync(path).should.be.true;
        });
    });

    it('should navigate backwards and forwards', function () {
      return ph.open('http://localhost:3000')
        .open('http://localhost:3000/page1.html')
        .back()
        .url()
        .then(function (url) {
          url.should.equal('http://localhost:3000/');
        })
        .forward()
        .url(function (url) {
          url.should.equal('http://localhost:3000/page1.html');
        });
    });

    it('should refresh the page', function () {
      var count = 0;
      ph.on('onLoadFinished', function () {
        count++;
      });

      return ph.open('http://localhost:3000')
        .refresh()
        .then(function () {
          count.should.equal(2);
        });
    });

    it('should focus an element', function () {
      return ph.open('http://localhost:3000')
        .focus('#typehere')
        .evaluate(function () {
          return document.activeElement.id;
        })
        .then(function (active) {
          active.should.equal('typehere');
        });
    });

  });

  describe('Events', function () {
    
    it('should emit on url change', function (done) {
      ph.open('http://localhost:3000')
        .once('onUrlChanged', function (url) {
          url.should.equal('http://localhost:3000/');
          done();
        });
    });

    it('should emit on resource requested', function (done) {
      ph.open('http://localhost:3000')
        .once('onResourceRequested', function (requestData, networkRequest) {
          requestData.url.should.equal('http://localhost:3000/');
          requestData.method.should.equal('GET');
          done();
        });
    });

    it('should emit on resource received', function (done) {
      ph.open('http://localhost:3000')
        .once('onResourceReceived', function (response) {
          response.url.should.equal('http://localhost:3000/');
          done();
        });
    });

    it('should emit on load started', function (done) {
      ph.open('http://localhost:3000')
        .once('onLoadStarted', function () {
          done();
        });
    });

    it('should emit on load finished', function (done) {
      ph.open('http://localhost:3000')
        .once('onLoadFinished', function (status) {
          status.should.equal('success');
          done();
        });
    });

    it('should emit on alert', function (done) {
      ph.open('http://localhost:3000/alert.html')
        .once('onAlert', function (msg) {
          msg.should.equal('test alert message');
          done();
        });
    });

    it('should emit on javascript error', function (done) {
      ph.open('http://localhost:3000/jserr.html')
        .once('onError', function (msg) {
          msg.should.not.be.empty;
          done();
        });
    });

    it('should emit on navigation requested', function (done) {
      ph.open('http://localhost:3000')
        .once('onNavigationRequested', function (url, type, willNavigate, main) {
          url.should.equal('http://localhost:3000/');
          willNavigate.should.be.true;
          done();
        });
    });

  });

});