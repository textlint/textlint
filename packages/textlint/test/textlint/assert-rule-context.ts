// MIT © 2017 azu
"use strict";

import { TextlintRuleContext } from "@textlint/types";
import assert from "assert";

export function assertRuleContext(context: Readonly<TextlintRuleContext>) {
    assert.ok(context !== undefined);
    assert.ok(typeof context.id === "string");
    assert.ok(typeof context.Syntax === "object");
    assert.ok(typeof context.RuleError === "object");
    assert.ok(typeof context.fixer === "object");
    assert.ok(typeof context.getSource === "function");
    assert.ok(typeof context.report === "function");
}
