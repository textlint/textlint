// LICENSE : MIT
"use strict";
import { describe, it } from "vitest";
import * as assert from "node:assert";
import { getSeverity } from "../../src/shared/rule-severity.js";
import { TextlintRuleSeverityLevelKeys } from "../../src/context/TextlintRuleSeverityLevelKeys.js";
import type { TextlintRuleOptions } from "@textlint/types";

describe("rule-severity", function () {
    describe("getSeverity", function () {
        it("should return error severity when ruleConfig is undefined", function () {
            const severity = getSeverity(undefined);
            assert.strictEqual(severity, TextlintRuleSeverityLevelKeys.error);
        });

        it("should return error severity when ruleConfig is true", function () {
            const severity = getSeverity(true as unknown as TextlintRuleOptions);
            assert.strictEqual(severity, TextlintRuleSeverityLevelKeys.error);
        });

        it("should return none severity when ruleConfig is false", function () {
            const severity = getSeverity(false as unknown as TextlintRuleOptions);
            assert.strictEqual(severity, TextlintRuleSeverityLevelKeys.none);
        });

        it("should return error severity when severity is 'error'", function () {
            const severity = getSeverity({ severity: "error" });
            assert.strictEqual(severity, TextlintRuleSeverityLevelKeys.error);
        });

        it("should return warning severity when severity is 'warning'", function () {
            const severity = getSeverity({ severity: "warning" });
            assert.strictEqual(severity, TextlintRuleSeverityLevelKeys.warning);
        });

        it("should return info severity when severity is 'info'", function () {
            const severity = getSeverity({ severity: "info" });
            assert.strictEqual(severity, TextlintRuleSeverityLevelKeys.info);
        });

        it("should return error severity when severity is not specified", function () {
            const severity = getSeverity({});
            assert.strictEqual(severity, TextlintRuleSeverityLevelKeys.error);
        });

        it("should throw error when invalid severity is provided", function () {
            assert.throws(() => {
                getSeverity({ severity: "invalid" as unknown as "error" });
            }, /Please set following value to severity/);
        });
    });
});
