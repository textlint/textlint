// LICENSE : MIT
"use strict";
var TextLintTester = require("../src/textlint-tester");
var fixerRule = require("./fixtures/rule/fixer-rule-add");
var tester = new TextLintTester();
tester.run("fixer-rule-add", fixerRule, {
    valid: [
        "string."
    ],
    invalid: [
        {
            text: "This is fixed",
            output: "This is fixed.",
            errors: [
                {
                    message: "Please add . to end of a sentence.",
                    line: 1,
                    column: 14
                }
            ]
        }
    ]
});
