"use strict";
var gulp = require('gulp');
var textlint = require('gulp-textlint');
gulp.task('textlint', function() {
    return gulp.src('./*.md')
        .pipe(textlint());
});