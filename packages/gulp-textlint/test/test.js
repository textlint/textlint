// MIT © 2017 azu
"use strict";
const assert = require("assert");
const gulp = require("gulp");
const textlint = require("../index");
const path = require("path");
describe("gulp-textlint", () => {
    it("should pass a test", (done) => {
        gulp.src(`${__dirname}/fixtures/pass/*.md`)
            .pipe(
                textlint({
                    configFile: path.join(__dirname, ".textlintrc")
                })
            )
            .on("error", (error) => {
                done(error);
            })
            // TODO: why end is not called?
            .on("finish", () => done());
    });

    it("should fail a test", (done) => {
        gulp.src(`${__dirname}/fixtures/fail/*.md`)
            .pipe(
                textlint({
                    configFile: path.join(__dirname, ".textlintrc")
                })
            )
            .on("error", (error) => done())
            .on("end", () => {
                done(new Error("Test should fail"));
            });
    });
});
