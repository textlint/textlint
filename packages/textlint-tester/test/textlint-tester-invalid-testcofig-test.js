// LICENSE : MIT
"use strict";

const TextLintTester = require("../src/index");
const htmlPlugin = require("textlint-plugin-html");
const noTodoRule = require("textlint-rule-no-todo");
const tester = new TextLintTester();
const assert = require("assert");

const testConfigs = [
    {
        description: "TestConfig is an empty object",
        config: {},
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
        expectedErrorMessage: "plugin property not found"
    }
];

describe("new-style-of-test: invalid testConfig", () => {
    testConfigs.forEach(testConfig => {
        it(`Should throw assertion error: ${testConfig.description}`, () => {
            try {
                tester.run("invalid-testConfig-test", testConfig.config, {
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
                });
            } catch (err) {
                assert.equal(err.code, "ERR_ASSERTION");
                assert.equal(err.message, testConfig.expectedErrorMessage);
            }
        });
    });
});
