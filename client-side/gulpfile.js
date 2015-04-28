var gulp = require('gulp');
var uglify = require('gulp-uglify');
var htmlreplace = require('gulp-html-replace');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var streamify = require('gulp-streamify');

var path = {
  HTML: 'src/index.html',
  MINIFIED_OUT: 'build.min.js',
  OUT: 'build.js',
  DEST: 'dist',
  DEST_BUILD: 'dist/build',
  DEST_SRC: 'dist/src',
  ENTRY_POINT: './js/client-main.js'
};

gulp.on('error', function(err) {
      console.log(err.message);
      this.end();
    }).task('copy', function(){
  gulp.src(path.HTML)
    .pipe(gulp.dest(path.DEST));
});

gulp.on('error', function(err) {
      console.log(err.message);
      this.end();
    }).task('watch', function() {
  gulp.watch(path.HTML, ['copy']);

  var watcher  = watchify(browserify({
    entries: [path.ENTRY_POINT],
    transform: [reactify],
    debug: true,
    cache: {}, packageCache: {}, fullPaths: true
  }));

  return watcher.on('update', function () {
    watcher.bundle()
      .pipe(source(path.OUT))
      .pipe(gulp.dest(path.DEST_SRC));
      console.log('Updated');
  })
    .bundle().on('error', function(err) {
      console.log(err.message);
      this.end();
    })
    .pipe(source(path.OUT))
    .pipe(gulp.dest(path.DEST_SRC));
});

gulp.on('error', function(err) {
      console.log(err.message);
      this.end();
    }).task('build', function(){
  var b = browserify({
    entries: [path.ENTRY_POINT],
    transform: [reactify],
  });

  return b.bundle().on('error', function(err) {
      console.log(err.message);
      this.end();
    })
    .pipe(source(path.MINIFIED_OUT))
    .pipe(streamify(uglify(path.MINIFIED_OUT)))
    .pipe(gulp.dest(path.DEST_BUILD));
});

gulp.on('error', function(err) {
      console.log(err.message);
      this.end();
    }).task('replaceHTML', function(){
  gulp.src(path.HTML)
    .pipe(htmlreplace({
      'js': 'build/' + path.MINIFIED_OUT
    }))
    .pipe(gulp.dest(path.DEST));
});

gulp.on('error', function(err) {
      console.log(err.message);
      this.end();
    }).task('production', ['replaceHTML', 'build']);

gulp.on('error', function(err) {
      console.log(err.message);
      this.end();
    }).task('default', ['watch']);