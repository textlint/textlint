// LICENSE : MIT
"use strict";
const test = require("textlint-ast-test").test;
const parse = require("../lib/markdown/markdown-parser").parse;
var assert = require("power-assert");
var fs = require('fs');
var path = require('path');
// String -> [String]
function fileList(dir) {
    return fs.readdirSync(dir).reduce(function (list, file) {
        var name = path.join(dir, file);
        var isDir = fs.statSync(name).isDirectory();
        return list.concat(isDir ? fileList(name) : [name]);
    }, []);
}
describe("Compliance tests", function () {
    context("compatible for Unist", function () {
        it("should have position", function () {
            var AST = parse("text");
            assert(typeof AST.position === "object");
            assert(typeof AST.position.start === "object");
            assert(typeof AST.position.start.line === "number");
            assert(typeof AST.position.start.column === "number");
            assert(typeof AST.position.end === "object");
            assert(typeof AST.position.end.line === "number");
            assert(typeof AST.position.end.column === "number");
        });
    });
    context("when use fixtures", function () {
        var fixtureFiles = fileList(path.join(__dirname, "fixtures"));
        fixtureFiles.forEach(function (filePath) {
            var fileName = path.basename(filePath);
            it("should pass " + fileName + " and return AST has type", function () {
                var content = fs.readFileSync(filePath, "utf-8");
                var AST = parse(content);
                test(AST);
            });
        });
    });
});
