// LICENSE : MIT
"use strict";
// parse all fixture and should has
const assert = require("assert");
const parse = require("../src/markdown-parser").parse;
const fs = require("fs");
const path = require("path");
const isTxtAST = require("@textlint/ast-tester").isTxtAST;
describe("parsing", function() {
    const fixtureDir = path.join(__dirname, "fixtures");
    fs.readdirSync(fixtureDir).forEach(function(filePath) {
        const dirName = path.basename(filePath);
        it(`${dirName} match AST`, function() {
            const input = fs.readFileSync(path.join(fixtureDir, filePath, "input.md"), "utf-8");
            const AST = parse(input);
            assert(isTxtAST(AST), "AST Should be valid AST");
            const output = JSON.parse(fs.readFileSync(path.join(fixtureDir, filePath, "output.json"), "utf-8"));
            assert.deepEqual(AST, output);
        });
    });
});
