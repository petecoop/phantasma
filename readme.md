# Phantasma

A high level promise based wrapper for [PhantomJS](http://phantomjs.org/)

**This project is currently in development, when I think it's ready for use 1.0.0 will be released**

The aim is to make interacting with PhantomJS from node as simple as possible. All actions are asynchronous and return a [bluebird](https://www.npmjs.org/package/bluebird) promise. The promises have been extended with Phantasma methods, allowing for a fluent API.

This project is heavily influenced by [Nightmare](https://github.com/segmentio/nightmare).

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

... needs options

### Methods

#### .open(url)
Load the page at `url`.

#### .click(selector)
Clicks the `selector` element.

#### .type(selector, text)
Enters the `text` provided into the `selector` element.

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

#### .wait()
Wait until a page finishes loading, typically after a `.click()`.

#### .exit()
Close the phantomjs process

#### .viewport(width, height)
Set the viewport dimensions

#### .screenshot(path)
Saves a screenshot of the current page to the specified `path`. Useful for debugging. Note the path must include the file extension. Supported formats include .png, .gif, .jpeg, and .pdf.

#### .title()
Get the title of the current page, the result is passed to the resolved promise.


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

- `onUrlChanged` - callback(url)
- `onResourceRequested` - callback()
- `onResourceReceived` - callback(res)
- `onLoadStarted` - callback()
- `onLoadFinished` - callback(status)

[PhantomJS callbacks](https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage#callbacks-list)

## License 

[ISC](http://en.wikipedia.org/wiki/ISC_license)

Copyright (c) 2014, Pete Cooper - pete@petecoop.co.uk

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.