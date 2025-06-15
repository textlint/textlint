// LICENSE : MIT
"use strict";
import path from "node:path";
import { describe, it } from "vitest";
import * as assert from "node:assert";
import { loadFromDir } from "../../src/engine/rule-loader.js";
import { TextlintLintableRuleDescriptor } from "@textlint/kernel";

const fixtureDir = path.join(__dirname, "fixtures", "rule-loader");
describe("engine/rule-loader", function () {
    it("should return object", function () {
        const rules = loadFromDir(fixtureDir);
        assert.equal(typeof rules, "object");
        const keys = Object.keys(rules);
        assert.deepEqual(keys.sort(), ["foo", "bar"].sort());
        keys.forEach((key) => {
            const descriptor = new TextlintLintableRuleDescriptor({
                ruleId: key,
                rule: rules[key]
            });
            assert.strictEqual(descriptor.id, key);
        });
    });
    it("should filter by extension", function () {
        const rules = loadFromDir(fixtureDir, ".unknown");
        assert.deepEqual(rules, {});
    });
});
