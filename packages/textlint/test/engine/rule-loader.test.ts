// LICENSE : MIT
"use strict";
import path from "node:path";
import { describe, it } from "vitest";
import * as assert from "node:assert";
import { loadFromDirAsESM } from "../../src/engine/rule-loader.js";
import { TextlintLintableRuleDescriptor } from "@textlint/kernel";

const fixtureDir = path.join(__dirname, "fixtures", "rule-loader");
describe("engine/rule-loader", function () {
    it("should return object", async function () {
        const rules = await loadFromDirAsESM(fixtureDir);
        assert.equal(typeof rules, "object");
        rules.forEach((rule) => {
            const descriptor = new TextlintLintableRuleDescriptor({
                ruleId: rule.ruleId,
                rule: rule.rule
            });
            assert.strictEqual(descriptor.id, rule.ruleId);
        });
    });
    it("should filter by extension", async function () {
        const rules = await loadFromDirAsESM(fixtureDir, ".unknown");
        assert.deepEqual(rules, []);
    });
});
