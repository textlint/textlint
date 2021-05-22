// LICENSE : MIT
"use strict";
import TextLintTester from "../src/index";
import path from "path";
const fixerRule = require("./fixtures/rule/fixer-rule-add");
const tester = new TextLintTester();
tester.run("fixer-rule-add", fixerRule, {
    valid: ["string.", "- [ ] list item"],
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
            inputPath: path.join(__dirname, "fixtures/text/fixture-rule-add.md"),
            output: "This is fixed.\n",
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
