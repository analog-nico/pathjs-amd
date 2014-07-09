'use strict';

var gulp = require('gulp');
var runSequence = require('run-sequence');
var jshint = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');
var karma = require('karma').server;
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');


var paths = {
  requirejs: 'bower_components/requirejs/require.js',
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

});

gulp.task('lint-and-test', function (done) {
  runSequence('lint', 'test', done);
});

gulp.task('lint', function () {

  return gulp.src([
      paths.scripts,
      paths.specs,
      paths.fixtureScripts
    ])
    .pipe(jshint())
    .pipe(jshint.reporter(jshintStylish))
    .pipe(jshint.reporter('fail'));

});

gulp.task('test', function (done) {

  // http://karma-runner.github.io/0.12/config/configuration-file.html

  var config = {
    frameworks: ['jasmine'],
    files: [
      paths.scripts,
      paths.fixtureScripts,
      paths.fixtureTemplates,
      paths.specs
    ],
    preprocessors: {
      '**/*.html': 'html2js'
    },
    reporters: ['spec', 'coverage'],
    plugins: [
      'karma-jasmine',
      'karma-html2js-preprocessor',
      'karma-phantomjs-launcher',
      'karma-spec-reporter',
      'karma-coverage'
    ],
    autoWatch: false,
    singleRun: true,
    browsers: ['PhantomJS']
  };
  config.preprocessors[paths.scripts] = 'coverage';

  karma.start(config, done);

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
