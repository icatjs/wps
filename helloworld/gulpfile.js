var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var shim = require('browserify-shim');
var source = require('vinyl-source-stream');
 
gulp.task('build', function () {
  browserify({
    entries: 'index.jsx',
    extensions: ['.jsx'],
    debug: true
  })
  .transform(babelify, {presets: ["es2015", "react"], plugins: ["react-originjs"]})
  .transform(shim)
  .bundle()
  .pipe(source('bundle.js'))
  .pipe(gulp.dest('dist'));
});

gulp.task('watch', function(){
	gulp.watch(['*.jsx'], ['build']);
});

gulp.task('default', ['build']);