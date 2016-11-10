// LICENSE : MIT
"use strict";
var assert = require("assert");
var TextLintCore = require("textlint").TextLintCore;
import {testInvalid} from "../src/test-util";
var brokenRule = require("./fixtures/rule/broken-rule-report-invalid-range");
describe("Broken Rule", function() {
    it("should assert invalid range", function() {
        var textlint = new TextLintCore();
        textlint.setupRules({
            "broken-rule": brokenRule
        });
        return testInvalid(textlint, "text", ".md", [
            {
                message: "Found TODO: '- [ ] string'",
                line: 1,
                column: 3
            }
        ]).then(() => {
            throw new Error("WRONG");
        }).catch(error => {
            assert(error.name === "AssertionError");
        });
    });
});
