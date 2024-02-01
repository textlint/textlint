"use strict";
// See https://github.com/textlint/textlint/tree/master/packages/textlint-tester
import TextLintTester from "textlint-tester";
// rule
import rule from "../src/index";

const tester = new TextLintTester();
// ruleName, rule, { valid, invalid }
tester.run("rule", rule, {
    valid: [
        // no match
        "text",
        // partial match
        "OK."
    ],
    invalid: [
        // inline file
        {
            text: "jquery",
            errors: [
                {
                    message: "Found jQuery!",
                    index: 0
                }
            ]
        },
        // single match
        {
            text: "It is bugs.",
            errors: [
                {
                    message: "Found bugs.",
                    line: 1,
                    column: 7
                }
            ]
        },
        // multiple match
        {
            text: `It has many bugs.

One more bugs`,
            errors: [
                {
                    message: "Found bugs.",
                    line: 1,
                    column: 13
                },
                {
                    message: "Found bugs.",
                    line: 3,
                    column: 10
                }
            ]
        }
    ]
});
