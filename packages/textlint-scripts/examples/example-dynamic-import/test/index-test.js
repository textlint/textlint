"use strict";
// See https://github.com/textlint/textlint/tree/master/packages/textlint-tester
import TextLintTester from "textlint-tester";
// rule
import rule from "../src/index.js";

const tester = new TextLintTester();
// ruleName, rule, { valid, invalid }
tester.run("rule", rule, {
    valid: ["valid"],
    invalid: [
        {
            text: "error",
            errors: [
                {
                    message: "esmWorker result: from esm",
                    index: 0
                }
            ]
        }
    ]
});
