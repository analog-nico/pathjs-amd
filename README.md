# PathJS

PathJS is a lightweight, client-side routing library that allows you to create single page applications using Hashes/Hashbangs and/or HTML5 PushState.

This repository was forked from [mtrpcic/pathjs](https://github.com/mtrpcic/pathjs) for continued maintenance. The latest version in this repository still serves as a drop-in replacement for the original version.

---

[![Build Status](https://travis-ci.org/analog-nico/pathjs-amd.svg?branch=master)](https://travis-ci.org/analog-nico/pathjs-amd) [![Coverage Status](https://img.shields.io/coveralls/analog-nico/pathjs-amd.svg?branch=master)](https://coveralls.io/r/analog-nico/pathjs-amd?branch=master) [![Code Climate](https://codeclimate.com/github/analog-nico/pathjs-amd.png)](https://codeclimate.com/github/analog-nico/pathjs-amd)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/analog-nico.svg)](https://saucelabs.com/u/analog-nico)

# Getting Started

Description forthcoming.
Visit [mtrpcic/pathjs](https://github.com/mtrpcic/pathjs) in the meantime. The API is still the same.

Additionally, this library
- can be required as an [**AMD module**](http://requirejs.org/docs/whyamd.html#amd),
- is [CommonJS Modules/1.0](http://wiki.commonjs.org/wiki/Modules/1.0) compatible, and
- can be used with [**Webpack**](http://webpack.github.io) and [**Browserify**](http://browserify.org).

# Change History

- 0.10.0 (2014-11-24)
    - **Breaking Change**: If a AMD module loader is present this library no longer exposes itself as a named module but instead as an anonymous module - in alignment to [common practice](https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#register-as-an-anonymous-module-).
    - Extended the module wrapper to also support CommonJS
    - Added tests to ensure compatibility with Webpack and Browserify
- 0.9.1 (2014-07-09)
    - Fixed AMD definition
- 0.9.0 (2014-07-09)
	- Cloned [mtrpcic/pathjs](https://github.com/mtrpcic/pathjs)
	- Wrapped the module to also expose it as an AMD module (named 'path') if a module loader is present
	- Set up modern dev environment with [Gulp](http://gulpjs.com), [JSHint](http://www.jshint.com), [Karma](http://karma-runner.github.io), [Jasmine](http://jasmine.github.io), [Istanbul](http://gotwarlost.github.io/istanbul/), [UglifyJS](http://lisperator.net/uglifyjs/)
	- Ported test cases to Jasmine
	- Set up continuous integration with [Travis CI](https://travis-ci.org), [Coveralls](https://coveralls.io), [Saucelabs](https://saucelabs.com)

# License (MIT)

See [LICENSE.md](LICENSE.md).
