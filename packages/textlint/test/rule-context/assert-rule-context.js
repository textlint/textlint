// MIT © 2017 azu
"use strict";
const assert = require("assert");
export function assertRuleContext(context) {
    assert.ok(context !== undefined);
    assert.ok(typeof context.id === "string", "assert: context.id");
    assert.ok(typeof context.Syntax === "object", "assert: context.Syntax");
    assert.ok(typeof context.RuleError === "function", "assert: context.RuleError");
    assert.ok(typeof context.fixer === "object", "assert: context.fixer");
    assert.ok(typeof context.getSource === "function", "assert: context.getSource");
    assert.ok(typeof context.report === "function", "assert: context.report");
}
