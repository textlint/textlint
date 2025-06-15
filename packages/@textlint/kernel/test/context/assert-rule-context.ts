// MIT © 2017 azu
"use strict";
import assert from "node:assert";
import type { TextlintRuleContext } from "@textlint/types";

export function assertRuledescribe(context: Readonly<TextlintRuleContext>) {
    assert.ok(context !== undefined);
    assert.ok(typeof context.id === "string");
    assert.ok(typeof context.Syntax === "object");
    assert.ok(typeof context.RuleError === "function");
    assert.ok(typeof context.fixer === "object");
    assert.ok(typeof context.getSource === "function");
    assert.ok(typeof context.report === "function");
}
