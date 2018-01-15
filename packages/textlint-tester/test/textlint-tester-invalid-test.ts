// LICENSE : MIT
"use strict";
import * as assert from "assert";

import * as fs from "fs";

import * as path from "path";

import { TextLintCore } from "textlint";
import { testInvalid } from "../src/test-util";

describe("Broken Rule", function() {
    const fixturesDir = path.join(__dirname, "fixtures", "broken-rules");
    fs.readdirSync(fixturesDir).map(caseName => {
        it(`should ${caseName.split("-").join(" ")} throw assertion Error`, () => {
            const fixtureRule = path.join(fixturesDir, caseName);
            const textlint = new TextLintCore();
            textlint.setupRules({ "broken-rule": require(fixtureRule) });
            return testInvalid({
                textlint,
                text: "text",
                ext: ".md",
                errors: [{ message: "Found TODO: '- [ ] string'", line: 1, column: 3 }]
            })
                .then(() => {
                    throw new Error("WRONG");
                })
                .catch(error => {
                    assert(error.code === "ERR_ASSERTION" || error.name === "AssertionError");
                });
        });
    });
});
