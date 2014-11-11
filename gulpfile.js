var browserify = require('browserify')
var gulp = require('gulp')
var source = require('vinyl-source-stream')

var header = require('gulp-header')
var jshint = require('gulp-jshint')
var plumber = require('gulp-plumber')
var rename = require('gulp-rename')
var streamify = require('gulp-streamify')
var uglify = require('gulp-uglify')
var gutil = require('gulp-util')

var pkg = require('./package.json')
var srcHeader = '/**\n\
 * Concur <%= pkg.version %> - https://github.com/insin/concur\n\
 * MIT Licensed\n\
 */\n'

var jsPath = './lib/*.js'
var jsEntryPoint = './lib/concur.js'
var standalone = 'Concur'
var distDir = './'
var distFile = 'concur.js'
var minDistFile = 'concur.min.js'

// Lints the build modules dir
gulp.task('lint', function() {
  return gulp.src(jsPath)
    .pipe(jshint('./.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
})

gulp.task('build-js', ['lint'], function(){
  var b = browserify(jsEntryPoint, {
    debug: !gutil.env.production
  , standalone: standalone
  })

  var stream = b.bundle()
    .on('error', function(e) {
      console.error(e)
    })
    .pipe(source(distFile))
    .pipe(streamify(header(srcHeader, {pkg: pkg})))
    .pipe(gulp.dest(distDir))

  if (gutil.env.production) {
    stream = stream
      .pipe(rename(minDistFile))
      .pipe(streamify(uglify()))
      .pipe(streamify(header(srcHeader, {pkg: pkg})))
      .pipe(gulp.dest(distDir))
  }

  return stream
})

gulp.task('watch', function() {
  gulp.watch(jsPath, ['build-js'])
})

gulp.task('default', ['build-js', 'watch'])
