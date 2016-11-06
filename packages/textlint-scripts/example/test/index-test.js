"use strict";
const TextLintTester = require("textlint-tester");
const tester = new TextLintTester();
// rule
const rule = require("../src/index");
// ruleName, rule, { valid, invalid }
tester.run("rule", rule, {
    valid: [
        // no match
        "text",
        // partial match
        "OK."
    ],
    invalid: [
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
                    column: 13
                }
            ]
        },

    ]
});