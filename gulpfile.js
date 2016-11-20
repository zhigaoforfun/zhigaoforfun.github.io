'use strict';
var gulp = require('gulp'), runSequence = require('run-sequence').use(gulp);

gulp.task('build', function () {
    runSequence('copyNgTimeline');
});

gulp.task('copyNgTimeline', function() {
   gulp.src('./bower_local/angular-timeline/dist/**/*.{css,js}')
   .pipe(gulp.dest('./bower_components/angular-timeline/dist'));
   console.log("copied");
});

