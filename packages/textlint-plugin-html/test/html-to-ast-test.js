// LICENSE : MIT
"use strict";
const assert = require("power-assert");
const fs = require("fs");
const path = require("path");
const test = require("textlint-ast-test").test;
const glob = require("glob");
import { parse } from "../src/html-to-ast";
describe("html-to-ast-test", function() {
    it("should return AST that passed isTxtAST", function() {
        const fixture = fs.readFileSync(path.join(__dirname, "fixtures/wikipedia.html"), "utf-8");
        const AST = parse(fixture);
        test(AST);
    });
    // test-case is come from https://github.com/wooorm/rehype
    // MIT
    context("test-case", () => {
        const htmls = glob.sync(__dirname + "/ast-test-case/*/index.html");
        const directories = htmls.map(filePath => {
            return path.dirname(filePath);
        });
        const ignoreTestCase = /element-broken-close/;
        directories.forEach(directory => {
            if (ignoreTestCase.test(directory)) {
                xit(`Skip ${path.basename(directory)}`, () => {});
                return;
            }
            it(`should parse to ast ${path.basename(directory)}`, () => {
                const content = fs.readFileSync(path.join(directory, "index.html"), "utf-8");
                const expected = JSON.parse(fs.readFileSync(path.join(directory, "index.json"), "utf-8"));
                const AST = parse(content);
                test(AST);
                assert.deepEqual(JSON.parse(JSON.stringify(AST)), expected);
            });
        });
    });
});
