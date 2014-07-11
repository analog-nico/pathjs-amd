/* jshint node: true */
'use strict';

var gulp = require('gulp');
var runSequence = require('run-sequence');
var jshint = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');
var karma = require('gulp-karma');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var fs = require('fs');
var coveralls = require('gulp-coveralls');


var paths = {
  requirejs: 'bower_components/requirejs/require.js',
  jquery: 'bower_components/jquery/dist/jquery.js',
  scripts: 'src/**/*.js',
  specs: 'test/spec/**/*.js',
  fixtureScripts: 'test/fixtures/**/*.js',
  fixtureTemplates: 'test/fixtures/**/*.html'
};


gulp.task('dev', ['watch', 'lint-and-test']);

gulp.task('watch', function () {

  gulp.watch([
    paths.scripts,
    paths.specs,
    paths.fixtureScripts,
    paths.fixtureTemplates
  ], [
    'lint-and-test'
  ]);

  gulp.watch([
    'gulpfile.js'
  ], [
    'lint'
  ]);

});

gulp.task('lint-and-test', function (done) {
  runSequence('lint', 'test', done);
});

gulp.task('lint', function () {

  return gulp.src([
      paths.scripts,
      paths.specs,
      paths.fixtureScripts,
      'gulpfile.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter(jshintStylish))
    .pipe(jshint.reporter('fail'));

});

gulp.task('test', function () {

  // http://karma-runner.github.io/0.12/config/configuration-file.html

  var config = {
    frameworks: ['jasmine'],
    files: [
      paths.jquery,
      paths.scripts,
      paths.fixtureScripts,
      paths.fixtureTemplates,
      paths.specs
    ],
    preprocessors: {
      '**/*.html': 'html2js'
    },
    reporters: ['spec', 'coverage'],
    coverageReporter: {
      type : 'lcov',
      dir : 'coverage/'
    },
    plugins: [
      'karma-jasmine',
      'karma-html2js-preprocessor',
      'karma-phantomjs-launcher',
      'karma-spec-reporter',
      'karma-coverage'
    ],
    autoWatch: false,
    singleRun: true,
    browsers: ['PhantomJS'],
    client: {
      useIframe: false
    }
  };
  config.preprocessors[paths.scripts] = 'coverage';

  return gulp.src(config.files)
    .pipe(karma(config));

});

gulp.task('dist', function (done) {
    runSequence('dist-clean', 'dist-src', 'dist-src-min', done);
});

gulp.task('dist-clean', function (done) {
    (require('rimraf'))('./dist', done);
});

gulp.task('dist-src', function () {
    return gulp.src('./src/*.js')
        .pipe(gulp.dest('./dist/'));
});

gulp.task('dist-src-min', function () {
    return gulp.src('./src/*.js')
        .pipe(uglify())
        .pipe(rename(function (path) {
            path.basename += '.min';
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('ci', function (done) {
    runSequence('lint', 'test', 'coveralls', 'test-on-saucelabs', done);
});

gulp.task('coveralls', function () {
    gulp.src('coverage/**/lcov.info')
        .pipe(coveralls());
});

gulp.task('test-on-saucelabs', function () {

    // https://github.com/saucelabs/karma-sauce-example

    // Use ENV vars on Travis and sauce.json locally to get credentials
    if (!process.env.SAUCE_USERNAME) {
        if (!fs.existsSync('sauce.json')) {
            console.log('Create a sauce.json with your credentials based on the sauce-sample.json file.');
            process.exit(1);
        } else {
            process.env.SAUCE_USERNAME = require('./sauce').username;
            process.env.SAUCE_ACCESS_KEY = require('./sauce').accessKey;
        }
    }

    // Browsers to run on Sauce Labs
    var customLaunchers = {
        'SL_Chrome': {
            base: 'SauceLabs',
            browserName: 'chrome'
        },
        'SL_Firefox': {
            base: 'SauceLabs',
            browserName: 'firefox',
            version: '26'
        },
        'SL_Safari': {
            base: 'SauceLabs',
            browserName: 'safari',
            platform: 'OS X 10.9',
            version: '7'
        },
        'SL_IE_9': {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 7',
            version: '9'
        },
        'SL_IE_10': {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 2012',
            version: '10'
        },
        'SL_IE_11': {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 8.1',
            version: '11'
        }
    };

    // http://karma-runner.github.io/0.12/config/configuration-file.html

    var config = {
        frameworks: ['jasmine'],
        files: [
            paths.jquery,
            paths.scripts,
            paths.fixtureScripts,
            paths.fixtureTemplates,
            paths.specs
        ],
        preprocessors: {
            '**/*.html': 'html2js'
        },
        // Spec reporter crashes in IE 9 if not using an iframe. Maybe because some Polyfills are missing.
        reporters: ['dots', 'saucelabs'],
        plugins: [
            'karma-jasmine',
            'karma-html2js-preprocessor',
            'karma-spec-reporter',
            'karma-sauce-launcher'
        ],
        autoWatch: false,
        singleRun: true,
        sauceLabs: {
            testName: 'All tests',
            startConnect: false // Either install and run Sauce Connect or set this to true
        },
        customLaunchers: customLaunchers,
        browsers: Object.keys(customLaunchers),
        client: {
            useIframe: false // Required by IE 9 to allow using the back button
        }
    };

    return gulp.src(config.files)
        .pipe(karma(config));

});

gulp.task('test-on-browserstack', function () {

    // https://github.com/karma-runner/karma-browserstack-launcher

    // Use ENV vars on Travis and browserstack.json locally to get credentials
    if (!process.env.BROWSER_STACK_USERNAME) {
        if (!fs.existsSync('browserstack.json')) {
            console.log('Create a browserstack.json with your credentials based on the browserstack-sample.json file.');
            process.exit(1);
        } else {
            process.env.BROWSER_STACK_USERNAME = require('./browserstack').username;
            process.env.BROWSER_STACK_ACCESS_KEY = require('./browserstack').accessKey;
        }
    }

    // Browsers to run on Browserstack
    var customLaunchers = {
        'BS_Chrome': {
            base: 'BrowserStack',
            browser: 'chrome',
            os: 'OS X',
            os_version: 'Mountain Lion'
        },
        'BS_Safari': {
            base: 'BrowserStack',
            browser: 'safari',
            os: 'OS X',
            os_version: 'Mountain Lion'
        },
        'BS_Firefox': {
            base: 'BrowserStack',
            browser: 'firefox',
            os: 'Windows',
            os_version: '8'
        },
        'BS_IE_9': {
            base: 'BrowserStack',
            browser: 'ie',
            browser_version: '9.0',
            os: 'Windows',
            os_version: '7'
        },
        'BS_IE_10': {
            base: 'BrowserStack',
            browser: 'ie',
            browser_version: '10.0',
            os: 'Windows',
            os_version: '8'
        },
        'BS_IE_11': {
            base: 'BrowserStack',
            browser: 'ie',
            browser_version: '11.0',
            os: 'Windows',
            os_version: '8.1'
        }
    };

    // http://karma-runner.github.io/0.12/config/configuration-file.html

    var config = {
        frameworks: ['jasmine'],
        files: [
            paths.jquery,
            paths.scripts,
            paths.fixtureScripts,
            paths.fixtureTemplates,
            paths.specs
        ],
        preprocessors: {
            '**/*.html': 'html2js'
        },
        // Spec reporter crashes in IE 9 if not using an iframe. Maybe because some Polyfills are missing.
        reporters: ['dots'],
        plugins: [
            'karma-jasmine',
            'karma-html2js-preprocessor',
            'karma-spec-reporter',
            'karma-browserstack-launcher'
        ],
        autoWatch: false,
        singleRun: true,
        customLaunchers: customLaunchers,
        browsers: Object.keys(customLaunchers),
        client: {
            useIframe: false // Required by IE 9 to allow using the back button
        }
    };

    return gulp.src(config.files)
        .pipe(karma(config));

});
