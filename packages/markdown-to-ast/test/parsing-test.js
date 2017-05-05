// LICENSE : MIT
"use strict";
// parse all fixture and should has
var assert = require("power-assert");
var parse = require("../src/markdown-parser").parse;
var TraverseController = require("txt-ast-traverse").Controller;
var traverseController = new TraverseController();
var fs = require("fs");
var path = require("path");
// String -> [String]
function fileList(dir) {
    return fs.readdirSync(dir).reduce(function (list, file) {
        var name = path.join(dir, file);
        var isDir = fs.statSync(name).isDirectory();
        return list.concat(isDir ? fileList(name) : [name]);
    }, []);
}
describe("parsing", function () {
    context("fixtures parsing", function () {
        var fixtureFiles = fileList(path.join(__dirname, "fixtures"));
        fixtureFiles.forEach(function (filePath) {
            var fileName = path.basename(filePath);
            it("should parse " + fileName + " and return AST has type", function () {
                var content = fs.readFileSync(filePath, "utf-8");
                var AST = parse(content);
                traverseController.traverse(AST, {
                    enter: function (node, parent) {
                        assert(typeof node.type !== "undefined", "it is failure to parse:" + filePath);
                    }
                });
            });
        });
    });
});
