import * as assert from "node:assert";
import * as path from "node:path";
import { describe, it } from "vitest";
import { loadConfig, loadPackagesFromRawConfig } from "../src/index.js";

const modulesDir = path.join(__dirname, "modules_fixtures");

describe("preset child rule names", () => {
    it("returns configuration file information and errors for each invalid preset", async () => {
        const configFilePath = path.join(__dirname, "fixtures", "unknown-preset-child.json");
        const result = await loadConfig({ configFilePath, node_modulesDir: modulesDir });
        assert.strictEqual(result.ok, false);
        if (!result.ok) {
            assert.strictEqual(result.configFilePath, configFilePath);
            assert.strictEqual(result.error.message, "Can not load rule");
            assert.deepStrictEqual(result.error.errors.map((error) => error.message).sort(), [
                'Unknown rule "invalid-rule" in preset "@scope/preset-abc".',
                'Unknown rule "invalid-rule" in preset "preset-abc".'
            ]);
        }
    });

    it.each([
        { presetName: "preset-abc", ruleKey: "invalid-rule", options: true },
        { presetName: "preset-abc", ruleKey: "invalid-rule", options: false },
        { presetName: "preset-abc", ruleKey: "invalid-rule", options: { key: true } },
        { presetName: "@scope/preset-abc", ruleKey: "invalid-rule", options: true },
        { presetName: "@scope/preset-abc", ruleKey: "invalid-rule", options: false },
        { presetName: "textlint-rule-preset-abc", ruleKey: "invalid-rule", options: true },
        { presetName: "preset-abc-but-unique-rule-key", ruleKey: "a", options: true },
        { presetName: "preset-abc", ruleKey: "toString", options: false }
    ])("rejects $ruleKey in $presetName with options $options", async ({ presetName, ruleKey, options }) => {
        const result = await loadPackagesFromRawConfig({
            rawConfig: { rules: { [presetName]: { [ruleKey]: options } } },
            node_moduleDir: modulesDir
        });
        assert.strictEqual(result.ok, false);
        if (!result.ok) {
            assert.strictEqual(result.error.message, "Can not load rule");
            assert.strictEqual(result.error.errors.length, 1);
            assert.strictEqual(result.error.errors[0].message, `Unknown rule "${ruleKey}" in preset "${presetName}".`);
        }
    });

    it.each(["preset-abc", "@scope/preset-abc", "textlint-rule-preset-abc"])(
        "accepts known enabled and disabled child rules in %s",
        async (presetName) => {
            const result = await loadPackagesFromRawConfig({
                rawConfig: { rules: { [presetName]: { a: true, b: false, c: { customOption: "value" } } } },
                node_moduleDir: modulesDir
            });
            assert.ok(result.ok);
            assert.deepStrictEqual(
                result.config.rules.map((rule) => rule.options),
                [true, false, { customOption: "value" }]
            );
        }
    );

    it("accepts the preset's exported keys when they differ from rule module names", async () => {
        const result = await loadPackagesFromRawConfig({
            rawConfig: {
                rules: { "preset-abc-but-unique-rule-key": { uniqueA: true, uniqueB: false, uniqueC: { key: true } } }
            },
            node_moduleDir: modulesDir
        });
        assert.ok(result.ok);
        assert.deepStrictEqual(
            result.config.rules.map((rule) => ({
                ruleKey: rule.type === "RuleInPreset" ? rule.ruleKey : undefined,
                options: rule.options
            })),
            [
                { ruleKey: "uniqueA", options: true },
                { ruleKey: "uniqueB", options: false },
                { ruleKey: "uniqueC", options: { key: true } }
            ]
        );
    });

    it("preserves preset severity and passes through child rule options", async () => {
        const result = await loadPackagesFromRawConfig({
            rawConfig: {
                rules: {
                    "preset-abc-with-severity": {
                        a: true,
                        b: { severity: "info", customOption: { nested: true } },
                        c1: false
                    }
                }
            },
            node_moduleDir: modulesDir
        });
        assert.ok(result.ok);
        assert.deepStrictEqual(
            result.config.rules.map((rule) => rule.options),
            [
                { severity: "warning", presetOption: "default" },
                { severity: "info", customOption: { nested: true } },
                false,
                { severity: "warning" }
            ]
        );
    });

    it.each([true, false, {}])("preserves whole-preset options %j", async (options) => {
        const result = await loadPackagesFromRawConfig({
            rawConfig: { rules: { "preset-abc": options } },
            node_moduleDir: modulesDir
        });
        assert.ok(result.ok);
        assert.strictEqual(result.config.rules.length, options === false ? 0 : 3);
    });
});
