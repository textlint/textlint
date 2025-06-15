// LICENSE : MIT
"use strict";
import * as assert from "node:assert";
import { createTestLinter, createTextlintKernelDescriptor } from "../lib/src/textlint-tester.js";
import { testValid, testInvalid } from "../lib/src/test-util.js";
import rule from "./fixtures/rule/no-todo";

describe("Error format", () => {
    const textlint = createTestLinter(
        createTextlintKernelDescriptor({
            testName: "no-todo",
            testRuleDefinition: rule
        })
    );

    describe("valid", () => {
        describe("when w/o description", () => {
            it(`should output error messages in a specific format`, async () => {
                const errorMsg = `valid: should have no errors but had Error results:
===Text===:
- [ ] test

==Result==:
{
    "messages": [
        {
            "type": "lint",
            "ruleId": "no-todo",
            "message": "Found TODO: '- [ ] test'",
            "index": 0,
            "line": 1,
            "column": 1,
            "range": [
                0,
                6
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 1
                },
                "end": {
                    "line": 1,
                    "column": 7
                }
            },
            "severity": 2
        }
    ],
    "filePath": "<markdown>"
}`;

                await assert.rejects(
                    async () => {
                        await testValid({
                            textlint,
                            text: "- [ ] test",
                            ext: ".md"
                        });
                    },
                    (err: Error) => {
                        assert.ok(err.message.includes(errorMsg));
                        return true;
                    }
                );
            });
        });

        describe("when w/ description", () => {
            it(`should output error messages in a specific format`, async () => {
                const errorMsg = `valid: should have no errors but had Error results:
===Description===:
when valid it expects to raise an error.

===Text===:
- [ ] test

==Result==:
{
    "messages": [
        {
            "type": "lint",
            "ruleId": "no-todo",
            "message": "Found TODO: '- [ ] test'",
            "index": 0,
            "line": 1,
            "column": 1,
            "range": [
                0,
                6
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 1
                },
                "end": {
                    "line": 1,
                    "column": 7
                }
            },
            "severity": 2
        }
    ],
    "filePath": "<markdown>"
}`;

                await assert.rejects(
                    async () => {
                        await testValid({
                            textlint,
                            text: "- [ ] test",
                            ext: ".md",
                            description: "when valid it expects to raise an error."
                        });
                    },
                    (err: Error) => {
                        assert.ok(err.message.includes(errorMsg));
                        return true;
                    }
                );
            });
        });
    });

    describe("invalid", () => {
        describe("when w/o description", () => {
            it(`should output error messages in a specific format`, async () => {
                const errorMsg = `invalid: should have 1 errors but had 0:
===Text===:
text

==Result==:
{
    "messages": [],
    "filePath": "<markdown>"
}`;
                await assert.rejects(
                    async () => {
                        await testInvalid({
                            textlint,
                            text: "text",
                            ext: ".md",
                            errors: [{ message: "Found TODO: '- [ ] string'", line: 1, column: 3 }]
                        });
                    },
                    (err: Error) => {
                        assert.ok(err.message.includes(errorMsg));
                        return true;
                    }
                );
            });
        });

        describe("when w/ description", () => {
            it(`should output error messages in a specific format`, async () => {
                const errorMsg = `invalid: should have 1 errors but had 0:
===Description===:
when invalid it expects to raise an error.

===Text===:
text

==Result==:
{
    "messages": [],
    "filePath": "<markdown>"
}`;
                await assert.rejects(
                    async () => {
                        await testInvalid({
                            textlint,
                            text: "text",
                            ext: ".md",
                            errors: [{ message: "Found TODO: '- [ ] string'", line: 1, column: 3 }],
                            description: "when invalid it expects to raise an error."
                        });
                    },
                    (err: Error) => {
                        assert.ok(err.message.includes(errorMsg));
                        return true;
                    }
                );
            });
        });
    });
});
