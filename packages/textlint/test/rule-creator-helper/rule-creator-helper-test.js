// LICENSE : MIT
"use strict";
import assert from "power-assert";
import {
    hasLinter,
    getLinter,
    hasFixer,
    getFixer,
    isRuleModule,
    assertRuleShape
} from "../../src/core/rule-creator-helper";
import FixerRule from "./fixtures/fixer";
import FixerOnlyRule from "./fixtures/fixer-only-is-bad";
import LinterRule from "./fixtures/linter";
import SimpleModule from "./fixtures/foo";

describe("rule-creator-helper", function () {
    it("#hasLinter", function () {
        assert(hasLinter(FixerRule));
        assert(hasLinter(LinterRule));
        assert(!hasLinter(FixerOnlyRule));
        assert(!hasLinter(SimpleModule));
    });
    it("#getLinter", function () {
        assert(typeof getLinter(FixerRule) === "function");
        assert(typeof getLinter(LinterRule) === "function");
        assert.throws(() => {
            getLinter(FixerOnlyRule);
        });
        assert.throws(() => {
            getLinter(SimpleModule);
        });
    });
    it("#hasFixer", function () {
        assert(hasFixer(FixerRule));
        assert(!hasFixer(LinterRule));
        assert(!hasFixer(FixerOnlyRule));
        assert(!hasFixer(SimpleModule));
    });
    it("#getFixer", function () {
        assert(typeof getFixer(FixerRule) === "function");
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
    it("#isRuleModule", function () {
        assert(isRuleModule(FixerRule));
        assert(isRuleModule(LinterRule));
        assert(!isRuleModule(FixerOnlyRule));
        assert(!isRuleModule(SimpleModule));
    });
    it("#assertRuleShape", function () {
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
