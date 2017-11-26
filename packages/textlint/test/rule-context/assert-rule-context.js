// MIT © 2017 azu
"use strict";
const assert = require("assert");
export function assertRuleContext(context) {
    assert(context !== undefined);
    assert(typeof context.id === "string", "assert: context.id");
    assert(typeof context.Syntax === "object", "assert: context.Syntax");
    assert(typeof context.RuleError === "function", "assert: context.RuleError");
    assert(typeof context.fixer === "object", "assert: context.fixer");
    assert(typeof context.getSource === "function", "assert: context.getSource");
    assert(typeof context.report === "function", "assert: context.report");
}
