// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { TextLintCore } from "textlint";
import { testValid, testInvalid } from "../src/test-util";
import noTodo from "./fixtures/rule/no-todo";

describe("Error format", () => {
    const textlint = new TextLintCore();
    beforeEach(() => textlint.setupRules({ "no-todo": noTodo }));
    afterEach(() => textlint.resetRules());

    describe("valid", () => {
        context("when w/o description", () => {
            it(`should output error messages in a specific format`, () => {
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
                return testValid({
                    textlint,
                    text: "- [ ] test",
                    ext: ".md",
                    description: undefined
                }).catch((error) => {
                    assert.ok(error.message === errorMsg);
                });
            });
        });

        context("when w/ description", () => {
            it(`should output error messages in a specific format`, () => {
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
                return testValid({
                    textlint,
                    text: "- [ ] test",
                    ext: ".md",
                    description: "when valid it expects to raise an error."
                }).catch((error) => {
                    assert.ok(error.message === errorMsg);
                });
            });
        });
    });

    describe("invalid", () => {
        context("when w/o description", () => {
            it(`should output error messages in a specific format`, () => {
                const errorMsg = `invalid: should have 1 errors but had 0:
===Text===:
text

==Result==:
{
    "messages": [],
    "filePath": "<markdown>"
}`;
                return testInvalid({
                    textlint,
                    text: "text",
                    ext: ".md",
                    errors: [{ message: "Found TODO: '- [ ] string'", line: 1, column: 3 }],
                    description: undefined
                }).catch((error) => {
                    assert.ok(error.message === errorMsg);
                });
            });
        });

        context("when w/ description", () => {
            it(`should output error messages in a specific format`, () => {
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
                return testInvalid({
                    textlint,
                    text: "text",
                    ext: ".md",
                    errors: [{ message: "Found TODO: '- [ ] string'", line: 1, column: 3 }],
                    description: "when invalid it expects to raise an error."
                }).catch((error) => {
                    assert.ok(error.message === errorMsg);
                });
            });
        });
    });
});
