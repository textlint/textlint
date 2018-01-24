// LICENSE : MIT
"use strict";

import TextLintTester = require("../src/index");

const htmlPlugin = require("textlint-plugin-html");
const noTodoRule = require("textlint-rule-no-todo");
const maxNumberOfLineRule = require("textlint-rule-max-number-of-lines");
const tester = new TextLintTester();

tester.run(
    "new-style-of-test: rule and plugin",
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
                text: `<p>TODO: no todo</p>
<p>Another paragraph</p>
<p>Yet another paragraph</p>`,
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

tester.run(
    "new-style-of-test: multiple rules and single plugin",
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

tester.run(
    "new-style-of-test: multiple rules and no plugin",
    {
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
                text: "日本語 is Japanese.",
                ext: ".txt"
            }
        ],
        invalid: [
            {
                text: `- TODO: no todo
- Another paragraph
- Yet another paragraph`,
                ext: ".md",
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
                        column: 3
                    }
                ]
            }
        ]
    }
);
