// LICENSE : MIT
"use strict";
const assert = require("assert");
const path = require("path");
const fs = require("fs");
const TextLintCore = require("textlint").TextLintCore;
import {testInvalid} from "../src/test-util";
describe("Broken Rule", function() {
    const fixturesDir = path.join(__dirname, 'fixtures', "broken-rules");
    fs.readdirSync(fixturesDir).map((caseName) => {
        it(`should ${caseName.split('-').join(' ')} throw assertion Error`, () => {
            const fixtureRule = path.join(fixturesDir, caseName);
            const textlint = new TextLintCore();
            textlint.setupRules({
                "broken-rule": require(fixtureRule)
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
});
