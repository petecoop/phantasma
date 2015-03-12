# Phantasma
[![Build Status](https://img.shields.io/travis/petecoop/phantasma.svg)](https://travis-ci.org/petecoop/phantasma)
[![NPM Version](https://img.shields.io/npm/v/phantasma.svg)](https://www.npmjs.org/package/phantasma)
[![NPM Downloads](https://img.shields.io/npm/dm/phantasma.svg)](https://www.npmjs.org/package/phantasma)


A high level promise based wrapper for [PhantomJS](http://phantomjs.org/)

The aim is to make interacting with PhantomJS from node as simple as possible. All actions are asynchronous and return a [bluebird](https://www.npmjs.org/package/bluebird) promise. The promises have been extended with Phantasma methods, allowing for a fluent API.

This project is heavily influenced by [Nightmare](https://github.com/segmentio/nightmare).

## Install

- Install PhantomJs: http://phantomjs.org/download.html

- `npm install phantasma`

## Examples

```js
var Phantasma = require('phantasma');

var ph = new Phantasma();

ph.open('https://duckduckgo.com')
  .type('#search_form_input_homepage', 'phantomjs')
  .click('#search_button_homepage')
  .wait()
  .screenshot('screenshot.png')
  .evaluate(function () {
    return document.querySelectorAll('.result').length;
  })
  .then(function (num) {
    console.log(num + ' results');
  })
  .catch(function (e) {
    console.log('error', e);
  })
  .finally(function () {
    console.log('done!');
    ph.exit();
  });
```

Any of the above methods can be replaced with a `.then` e.g.

```js
var Phantasma = require('phantasma');

var ph = new Phantasma();

ph.then(function () {
    return ph.open('https://duckduckgo.com');
  })
  .screenshot('screenshot.png')
  .finally(function () {
    ph.exit();
  });

```

This allows for conditionally changing the flow depending on the result of the last request:

```js
var ph = new Phantasma();

ph.open('https://duckduckgo.com')
  .type('#search_form_input_homepage', 'akjsdhjashda')
  .click('#search_button_homepage')
  .wait()
  .evaluate(function () {
    return document.querySelectorAll('.result').length;
  })
  .then(function (num) {
    if(!num){
      return ph.type('#search_form_input', 'phantomjs')
        .click('#search_button')
        .wait()
        .screenshot('screenshot.png');
    }
    return ph.screenshot('screenshot.png');
  })
  .finally(function () {
    ph.exit();
  });
```


## API

#### new Phantasma(options)
Create a new instance, initiates the phantomjs instance

The available options are:

- `diskCache: [true|false]`: enables disk cache (default is `false`).
- `ignoreSslErrors: [true|false]`: ignores SSL errors, such as expired or self-signed certificate errors (default is `true`).
- `loadImages: [true|false]`: load all inlined images (default is `true`).
- `localStoragePath: '/some/path'`: path to save LocalStorage content and WebSQL content (no default).
- `localStorageQuota: [Number]`: maximum size to allow for data (no default).
- `localToRemoteUrlAccess: [true|false]`: allows local content to access remote URL (default is `false`).
- `maxDiskCacheSize: [Number]`: limits the size of disk cache in KB (no default).
- `phantomPath`: specify a different custom path to PhantomJS (no default).
- `port: [Number]`: specifies the phantomjs port.
- `proxy: 'address:port'`: specifies the proxy server to use (e.g. `proxy: '192.168.1.42:8080'`) (no default).
- `proxyType: [http|socks5|none]`: specifies the type of the proxy server (default is `http`) (no default).
- `proxyAuth`: specifies the authentication information for the proxy, e.g. `proxyAuth: 'username:password'`) (no default).
- `sslProtocol: [sslv3|sslv2|tlsv1|any]` sets the SSL protocol for secure connections (default is `any`).
- `sslCertificatesPath: '/some/path'` Sets the location for custom CA certificates (if none set, uses system `default`).
- `timeout [Number]`: how long to wait for page loads in ms (default is `5000`).
- `webSecurity: [true|false]`: enables web security and forbids cross-domain XHR (default is `true`).

### Methods

#### .open(url)
Load the page at `url`. Will throw a Timeout error if it takes longer to complete than the timeout setting.

#### .wait()
Wait until a page finishes loading, typically after a `.click()`. Will throw a Timeout error if it takes longer to complete than the timeout setting.

#### .exit()
Close the phantomjs process.

#### .click(selector)
Clicks the `selector` element.

#### .type(selector, text)
Enters the `text` provided into the `selector` element.

#### .value(selector, text)
Sets the `text` provided as the value of the `selector` element.

#### .select(selector, value)
Sets the `value` of a select element to `value`.

#### .evaluate(fn, arg1, arg2,...)
Invokes `fn` on the page with `arg1, arg2,...`. All the `args` are optional. On completion it passes the return value of `fn` to the resolved promise. Example:

```js
var Phantasma = require('phantasma');
var p1 = 1;
var p2 = 2;

var ph = new Phantasma();

ph.evaluate(function (param1, param2) {
    // now we're executing inside the browser scope.
    return param1 + param2;
  }, p1, p2)
  .then(function (result) {
    // now we're inside Node scope again
    console.log(result);
  })
  .finally(function () {
    ph.exit();
  });
```

#### .viewport(width, height)
Set the viewport dimensions

#### .screenshot(path)
Saves a screenshot of the current page to the specified `path`. Useful for debugging. Note the path must include the file extension. Supported formats include .png, .gif, .jpeg, and .pdf.

#### .title()
Get the title of the current page, the result is passed to the resolved promise.

#### .url()
Get the url of the current page, the result is passed to the resolved promise.

#### .back()
Go back to the previous page. This will `.wait()` untill the page has loaded.

#### .forward()
Go forward to the next page. This will `.wait()` untill the page has loaded.

#### .refresh()
refresh the current page. This will `.wait()` untill the page has loaded.

#### .focus(selector)
Focus the `selector` element.

#### .injectJs(path)
Inject javascript at `path` into the currently open page.

#### .injectCss(style)
Inject CSS string `style` into the currently open page.

#### .content(html)
Get or set the content of the page, if `html` is set it will set, if not it will get.

### Events

Events extends node's EventEmitter.

#### .on(event, callback)
Executes `callback` when the `event` is emitted.

Example:

```js
var Phantasma = require('phantasma');

var ph = new Phantasma();

ph.open('https://duckduckgo.com')
  .type('#search_form_input_homepage', 'phantomjs')
  .click('#search_button_homepage')
  .wait()
  .catch(function (e) {
    console.log('error', e);
  })
  .finally(function () {
    console.log('done!');
    ph.exit();
  }).on('onUrlChanged', function (url) {
    console.log('url change', url);
  });
```

#### .once(event, callback)
Executes `callback` when the `event` is emitted only once.

#### Supported Events:

Supports the following phantomjs events, you can read more on these here ([PhantomJS callbacks](https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage#callbacks-list)):

- `onUrlChanged` - callback(url)
- `onResourceRequested` - callback(requestData, networkRequest)
- `onResourceReceived` - callback(response)
- `onLoadStarted` - callback()
- `onLoadFinished` - callback(status)
- `onAlert` - callback(msg)
- `onErr` - callback(msg, trace)
- `onNavigationRequested` - callback(url, type, willNavigate, main)

## Promise methods

You can use any of the methods available to bluebird [found here](https://github.com/petkaantonov/bluebird/blob/master/API.md).

The most useful methods are:

#### .then(fulfillHandler, rejectHandler)
Returns a new promise chained from the previous promise. The return value of the previous promise will be passed into this promise.


#### .finally(Function handler)
Pass a handler that will be ran regardless of the outcome of the previous promises. Useful for cleaning up the Phantasma process e.g.

```js
.finally(function () {
  ph.exit();
});
```

#### .catch(Function handler)
This is a catch-all exception handler - it can be used to find and log an error. e.g.

```js
.catch(function (e) {
  console.log(e);
});
```

#### .delay(ms)
Delay the next promise for `ms` milliseconds

## License 

[ISC](http://en.wikipedia.org/wiki/ISC_license)

Copyright (c) 2014, Pete Cooper - pete@petecoop.co.uk

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.