// LICENSE : MIT
"use strict";
import * as assert from "assert";
import {
    hasLinter,
    getLinter,
    hasFixer,
    getFixer,
    isRuleModule,
    assertRuleShape
} from "../../../src/descriptor/rule-creator-helper";
import FixerRule from "./fixtures/fixer";
import FixerOnlyRule from "./fixtures/fixer-only-is-bad";
import LinterRule from "./fixtures/linter";
import SimpleModule from "./fixtures/foo";

describe("rule-creator-helper", function() {
    it("#hasLinter", function() {
        assert.ok(hasLinter(FixerRule));
        assert.ok(hasLinter(LinterRule));
        assert.ok(!hasLinter(FixerOnlyRule));
        assert.ok(!hasLinter(SimpleModule));
    });
    it("#getLinter", function() {
        assert.ok(typeof getLinter(FixerRule) === "function");
        assert.ok(typeof getLinter(LinterRule) === "function");
        assert.throws(() => {
            getLinter(FixerOnlyRule);
        });
        assert.throws(() => {
            getLinter(SimpleModule);
        });
    });
    it("#hasFixer", function() {
        assert.ok(hasFixer(FixerRule));
        assert.ok(!hasFixer(LinterRule));
        assert.ok(!hasFixer(FixerOnlyRule));
        assert.ok(!hasFixer(SimpleModule));
    });
    it("#getFixer", function() {
        assert.ok(typeof getFixer(FixerRule) === "function");
        assert.throws(() => {
            getFixer(LinterRule);
        });
        assert.throws(() => {
            getFixer(FixerOnlyRule);
        });
        assert.throws(() => {
            getFixer(SimpleModule);
        });
    });
    it("#isRuleModule", function() {
        assert.ok(isRuleModule(FixerRule));
        assert.ok(isRuleModule(LinterRule));
        assert.ok(!isRuleModule(FixerOnlyRule));
        assert.ok(!isRuleModule(SimpleModule));
    });
    it("#assertRuleShape", function() {
        assertRuleShape(FixerRule);
        assertRuleShape(LinterRule);
        assert.throws(() => {
            assertRuleShape(FixerOnlyRule);
        });
        assert.throws(() => {
            assertRuleShape(SimpleModule);
        });
    });
});
