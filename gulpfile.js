/* jshint node: true */
'use strict';

var _ = require('lodash');
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

var karmaCommonConfig = {
    frameworks: ['jasmine'],
    files: [
        paths.jquery,
        paths.scripts,
        paths.fixtureScripts,
        paths.fixtureTemplates,
        paths.specs,
        { pattern: paths.requirejs, included: false }
    ],
    preprocessors: {
        '**/*.html': 'html2js'
    },
    reporters: ['spec'],
    plugins: [
        'karma-jasmine',
        'karma-html2js-preprocessor',
        'karma-phantomjs-launcher',
        'karma-spec-reporter'
    ],
    autoWatch: false,
    singleRun: true
};

function mergeConfig(commonConfig, individualConfig) {
    return _.merge(_.cloneDeep(commonConfig), individualConfig, function (a, b) {
        return _.isArray(a) ? a.concat(b) : undefined;
    });
}

function getConfigFiles(config) {
    return _.map(config.files, function (file) {
        if (_.isPlainObject(file)) {
            return file.pattern;
        }
        return file;
    });
}


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

    var config = mergeConfig(karmaCommonConfig, {
        reporters: ['coverage'],
        coverageReporter: {
            type: 'lcov',
            dir: 'coverage/'
        },
        plugins: [
            'karma-coverage'
        ],
        browsers: ['PhantomJS']
    });
    config.preprocessors[paths.scripts] = 'coverage';

    return gulp.src(getConfigFiles(config))
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
    runSequence('lint', 'test', 'coveralls', 'test-on-saucelabs-desktop', 'test-on-saucelabs-mobile', 'test-on-saucelabs-oldies', done);
});

gulp.task('coveralls', function () {
    gulp.src('coverage/**/lcov.info')
        .pipe(coveralls());
});

function loadSaucelabsCredentials() {

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

}

var karmaSaucelabsConfig = mergeConfig(karmaCommonConfig, {
    reporters: ['saucelabs'],
    plugins: [
        'karma-sauce-launcher'
    ],
    sauceLabs: {
        testName: 'All tests',
        startConnect: ((process.env.TRAVIS) ? true : false) // Either install and run Sauce Connect or set this to true
    },
    // to avoid DISCONNECTED messages when connecting to Saucelabs
    // http://oligofren.wordpress.com/2014/05/27/running-karma-tests-on-browserstack/
    browserDisconnectTimeout: 10000, // default 2000
    browserDisconnectTolerance: 1, // default 0
    browserNoActivityTimeout: 4 * 60 * 1000, //default 10000
    captureTimeout: 4 * 60 * 1000 //default 60000
});

gulp.task('test-on-saucelabs-desktop', function () {

    // https://github.com/saucelabs/karma-sauce-example

    loadSaucelabsCredentials();

    // Browsers to run on Sauce Labs
    var customLaunchers = {
        'SL_Chrome': {
            base: 'SauceLabs',
            browserName: 'chrome'
        },
        'SL_Firefox': {
            base: 'SauceLabs',
            browserName: 'firefox'
        },
        'SL_Safari': {
            base: 'SauceLabs',
            browserName: 'safari',
            platform: 'OS X 10.9'
        },
        'SL_Opera': {
            base: 'SauceLabs',
            browserName: 'opera'
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

    var config = mergeConfig(karmaSaucelabsConfig, {
        customLaunchers: customLaunchers,
        browsers: Object.keys(customLaunchers)
    });

    return gulp.src(getConfigFiles(config))
        .pipe(karma(config));

});

gulp.task('test-on-saucelabs-mobile', function () {

    // https://github.com/saucelabs/karma-sauce-example

    loadSaucelabsCredentials();

    // Browsers to run on Sauce Labs
    var customLaunchers = {
        'SL_IPHONE_IOS_7.1': {
            base: 'SauceLabs',
            browserName: 'iPhone',
            platform: 'OS X 10.9',
            version: '7.1'
        },
        'SL_IPAD_IOS_7.1': {
            base: 'SauceLabs',
            browserName: 'iPad',
            platform: 'OS X 10.9',
            version: '7.1'
        },
        'SL_ANDROID_4.3': {
            base: 'SauceLabs',
            browserName: 'Android',
            platform: 'Linux',
            version: '4.3'
        }
    };

    // http://karma-runner.github.io/0.12/config/configuration-file.html

    var config = mergeConfig(karmaSaucelabsConfig, {
        customLaunchers: customLaunchers,
        browsers: Object.keys(customLaunchers)
    });

    return gulp.src(getConfigFiles(config))
        .pipe(karma(config));

});

gulp.task('test-on-saucelabs-oldies', function () {

    // https://github.com/saucelabs/karma-sauce-example

    loadSaucelabsCredentials();

    // Browsers to run on Sauce Labs
    var customLaunchers = {
        'SL_IE_9': {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 7',
            version: '9'
        }/*,
        'SL_IE_8': {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows XP',
            version: '8'
        },
        'SL_IE_6': {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows XP',
            version: '6'
        }*/
    };

    // http://karma-runner.github.io/0.12/config/configuration-file.html

    var config = mergeConfig(karmaSaucelabsConfig, {
        customLaunchers: customLaunchers,
        browsers: Object.keys(customLaunchers),
        client: {
            useIframe: false // Required by IE 9 to allow using the back button
            // BTW, IE 10 & 11 currently error out when using a new window.
        }
    });
    // Spec reporter crashes in IE 9 if not using an iframe. Maybe because some Polyfills are missing.
    config.reporters = ['dots', 'saucelabs'];

    return gulp.src(getConfigFiles(config))
        .pipe(karma(config));

});
