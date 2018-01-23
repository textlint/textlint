// LICENSE : MIT
"use strict";

import TextLintTester = require("../src/index");

const htmlPlugin = require("textlint-plugin-html");
const noTodoRule = require("textlint-rule-no-todo");
const maxNumberOfLineRule = require("textlint-rule-max-number-of-lines");
const tester = new TextLintTester();

tester.run(
    "new-style-of-test",
    {
        plugins: [
            {
                pluginId: "html",
                plugin: htmlPlugin
            }
        ],
        rules: [
            {
                ruleId: "no-todo",
                rule: noTodoRule
            },
            {
                ruleId: "max-number-of-lines",
                rule: maxNumberOfLineRule,
                options: {
                    max: 2
                }
            }
        ]
    },
    {
        valid: [
            {
                text: "<p>日本語 is Japanese.</p>",
                ext: ".html"
            }
        ],
        invalid: [
            // line, column
            {
                text: `<p>TODO: no todo</p>
<p>Another paragraph</p>
<p>Yet another paragraph</p>`,
                ext: ".html",
                errors: [
                    {
                        message: "Document is too long(number of lines: 3).",
                        index: 0,
                        line: 1,
                        column: 1
                    },
                    {
                        message: "Found TODO: 'TODO: no todo'",
                        line: 1,
                        column: 4
                    }
                ]
            }
        ]
    }
);
