// LICENSE : MIT
"use strict";
import TextLintTester from "../src/index";
import path from "path";
import fixerRule from "./fixtures/rule/fixer-rule-add";

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
                    index: 13
                }
            ]
        },
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
        },
        // range
        {
            text: "- [ ] plain text",
            output: "- [ ] plain text.",
            ext: ".txt",
            errors: [
                {
                    message: "Please add . to end of a sentence.",
                    range: [16, 17]
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
                    loc: {
                        start: {
                            line: 1,
                            column: 17
                        },
                        end: {
                            line: 1,
                            column: 18
                        }
                    }
                }
            ]
        }
    ]
});
