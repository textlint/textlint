"use strict";
const gulp = require("gulp");
const textlint = require("gulp-textlint");
gulp.task("textlint", function() {
    return gulp.src("./*.md").pipe(textlint());
});
