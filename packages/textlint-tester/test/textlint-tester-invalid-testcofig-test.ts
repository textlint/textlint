// LICENSE : MIT
"use strict";

import * as assert from "assert";

const htmlPlugin = require("textlint-plugin-html");
const noTodoRule = require("textlint-rule-no-todo").default;
const maxNumberOfLineRule = require("textlint-rule-max-number-of-lines");
import { TextLintTester } from "../src/textlint-tester";

const tester = new TextLintTester();
const baseCase = {
    valid: [
        {
            text: "text",
            ext: ".md"
        }
    ],
    invalid: [
        {
            text: "- [ ] string",
            ext: ".md",
            errors: [{ message: "Found TODO: '- [ ] string'", line: 1, column: 3 }]
        }
    ]
};

const testConfigs = [
    {
        description: "TestConfig is an empty object",
        config: {},
        case: baseCase,
        expectedErrorMessage: "TestConfig is empty"
    },
    {
        description: "TestConfig has no rules, plugins only",
        config: {
            plugins: [
                {
                    pluginId: "html",
                    plugin: htmlPlugin
                }
            ]
        },
        case: baseCase,
        expectedErrorMessage: "TestConfig.rules should be an array"
    },
    {
        description: "TestConfig has rules property which is not an array",
        config: {
            rules: "rule",
            plugins: [
                {
                    pluginId: "html",
                    plugin: htmlPlugin
                }
            ]
        },
        case: baseCase,
        expectedErrorMessage: "TestConfig.rules should be an array"
    },
    {
        description: "TestConfig has rules property which is empty",
        config: {
            rules: [],
            plugins: [
                {
                    pluginId: "html",
                    plugin: htmlPlugin
                }
            ]
        },
        case: baseCase,
        expectedErrorMessage: "TestConfig.rules should have at least one rule"
    },
    {
        description: "One of rules has no ruleId",
        config: {
            rules: [
                {
                    rule: noTodoRule
                }
            ]
        },
        case: baseCase,
        expectedErrorMessage: "ruleId property not found"
    },
    {
        description: "One of rules has no rule",
        config: {
            rules: [
                {
                    ruleId: "no-todo"
                }
            ]
        },
        case: baseCase,
        expectedErrorMessage: "rule property not found"
    },
    {
        description: "TestConfig has plugins proeprty which is not an array",
        config: {
            plugins: htmlPlugin,
            rules: [
                {
                    ruleId: "no-todo",
                    rule: noTodoRule
                }
            ]
        },
        case: baseCase,
        expectedErrorMessage: "TestConfig.plugins should be an array"
    },
    {
        description: "One of plugins has no pluginId",
        config: {
            plugins: [
                {
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
        case: baseCase,
        expectedErrorMessage: "pluginId property not found"
    },
    {
        description: "One of plugins has no plugin",
        config: {
            plugins: [
                {
                    pluginId: "html"
                }
            ],
            rules: [
                {
                    ruleId: "no-todo",
                    rule: noTodoRule
                }
            ]
        },
        case: baseCase,
        expectedErrorMessage: "plugin property not found"
    },
    {
        description: "options in valid object when use with TestConfig",
        config: {
            plugins: [
                {
                    pluginId: "html",
                    plugin: htmlPlugin
                }
            ],
            rules: [
                {
                    ruleId: "max-number-of-lines",
                    rule: maxNumberOfLineRule
                }
            ]
        },
        case: {
            valid: [
                {
                    text: "日本語 is Japanese.",
                    ext: ".txt",
                    options: {
                        max: 2
                    }
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
                        }
                    ]
                }
            ]
        },
        expectedErrorMessage:
            "Could not specify options property in valid object when TestConfig was passed. Use TestConfig.rules.options."
    },
    {
        description: "options in invalid object when use with TestConfig",
        config: {
            plugins: [
                {
                    pluginId: "html",
                    plugin: htmlPlugin
                }
            ],
            rules: [
                {
                    ruleId: "max-number-of-lines",
                    rule: maxNumberOfLineRule
                }
            ]
        },
        case: {
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
                    options: {
                        max: 2
                    },
                    errors: [
                        {
                            message: "Document is too long(number of lines: 3).",
                            index: 0,
                            line: 1,
                            column: 1
                        }
                    ]
                }
            ]
        },
        expectedErrorMessage:
            "Could not specify options property in invalid object when TestConfig was passed. Use TestConfig.rules.options."
    }
];

describe("new-style-of-test: invalid testConfig", () => {
    testConfigs.forEach(testConfig => {
        it(`Should throw assertion error: ${testConfig.description}`, () => {
            try {
                tester.run("invalid-testConfig-test", testConfig.config as any, testConfig.case);
            } catch (err) {
                assert.ok(err instanceof assert.AssertionError);
                assert.equal(err.message, testConfig.expectedErrorMessage);
            }
        });
    });
});
