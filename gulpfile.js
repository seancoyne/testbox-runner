(function(){
	
	"use strict";
	
	var jshint = require('gulp-jshint');
	var gulp = require('gulp');
	var stylish = require('jshint-stylish');
	
	gulp.task('lint', function() {
	  return gulp.src([ "./index.js", "./lib/**/*.js", "./gulpfile.js" ])
	    .pipe(jshint())
	    .pipe(jshint.reporter(stylish));
	});
	
	gulp.task("default", [ "lint" ]);
	
})();