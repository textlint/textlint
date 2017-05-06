// LICENSE : MIT
"use strict";
const TextLintTester = require("../src/index");
const fixerRule = require("./fixtures/rule/fixer-rule-add");
const tester = new TextLintTester();
tester.run("fixer-rule-add", fixerRule, {
    valid: [
        "string.",
        "- [ ] list item"
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
        },
        {
            text: "- [ ] plain text",
            output: "- [ ] plain text.",
            ext: ".txt",
            errors: [
                {
                    message: "Please add . to end of a sentence.",
                    line: 1,
                    column: 17
                }
            ]
        }
    ]
});
