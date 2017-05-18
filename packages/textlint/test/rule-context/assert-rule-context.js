// MIT © 2017 azu
"use strict";
const assert = require("assert");
export function assertRuleContext(context) {
    assert(context !== undefined);
    assert(typeof context.id === "string");
    assert(typeof context.Syntax === "object");
    assert(typeof context.RuleError === "object");
    assert(typeof context.fixer === "object");
    assert(typeof context.getSource === "function");
    assert(typeof context.report === "function");
}
