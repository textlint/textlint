// LICENSE : MIT
"use strict";
var test = require("ava");
var TextLintTester = require("../src/textlint-tester");
var noTodo = require("textlint-rule-no-todo");
let tester = new TextLintTester();
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
                {message: "found: '- [ ] string'"}
            ]
        }
    ]
});