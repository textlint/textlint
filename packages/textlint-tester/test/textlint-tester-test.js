// LICENSE : MIT
"use strict";
var TextLintTester = require("../src/textlint-tester");
var noTodo = require("textlint-rule-no-todo");
var maxNumberOfLine = require("textlint-rule-max-number-of-lines");
var tester = new TextLintTester();
tester.run("no-todo", noTodo, {
    valid: [
        "string, test desu",
        {
            text: "日本語 is Japanese."
        }
    ],
    invalid: [
        {
            text: "- [ ] string",
            errors: [
                {
                    message: "found TODO: '- [ ] string'",
                    line: 1,
                    column: 1
                }
            ]
        },
        {
            text: "TODO: string",
            errors: [
                {
                    message: "found TODO: 'TODO: string'",
                    line: 1,
                    column: 1
                }
            ]
        }
    ]
});
tester.run("max-number-of-lines", maxNumberOfLine, {
    valid: [
        "string, test desu",
        {
            text: "日本語 is Japanese."
        }
    ],
    invalid: [
        {
            text: `1
2
3`,
            options: {
                max: 2
            },
            errors: [
                {
                    ruleId: "max-number-of-lines",
                    message: "Document is too long(number of lines: 3)."
                }
            ]
        }

    ]
});
