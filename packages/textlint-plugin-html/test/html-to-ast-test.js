// LICENSE : MIT
"use strict";
const assert = require("power-assert");
const fs = require("fs");
const path = require("path");
const test = require("textlint-ast-test").test;
import {parse} from "../src/html-to-ast";
describe("html-to-ast-test", function () {
    it("should return AST that passed isTxtAST", function () {
        const fixture = fs.readFileSync(path.join(__dirname, "fixtures/wikipedia.html"), "utf-8");
        const AST = parse(fixture);
        test(AST);
    });
});