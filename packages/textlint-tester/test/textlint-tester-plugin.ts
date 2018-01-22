// LICENSE : MIT
"use strict";

import TextLintTester = require("../src/index");

const htmlPlugin = require("textlint-plugin-html");
const noTodoRule = require("textlint-rule-no-todo");
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
                text: "<p>TODO: no todo</p>",
                ext: ".html",
                errors: [
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
