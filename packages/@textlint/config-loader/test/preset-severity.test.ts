import * as assert from "node:assert";
import * as path from "node:path";
import { describe, it } from "vitest";
import { loadPackagesFromRawConfig } from "../src/index.js";

// Test module directory - use relative path from test directory
const modulesDir = path.join(__dirname, "modules_fixtures");

// Type guard helper
function isObjectOptions(options: unknown): options is { [key: string]: unknown; severity?: string } {
    return typeof options === "object" && options !== null;
}

describe("Preset and Severity Combination Unit Tests", () => {
    describe("when preset has severity and user provides partial options", () => {
        it("should preserve preset severity while merging user options", async () => {
            // Create a test config that mimics the issue scenario
            const testConfig = {
                rules: {
                    "preset-abc-with-severity": {
                        a: {
                            userOption: true
                        },
                        b: {
                            customOption: "value"
                        }
                    }
                }
            };

            // Convert to raw config format
            const rawConfig = {
                ...testConfig,
                plugins: [],
                filterRules: []
            };

            const actual = await loadPackagesFromRawConfig({
                rawConfig,
                node_moduleDir: modulesDir
            });

            assert.ok(
                actual.ok,
                actual.ok ? "Config loading should succeed" : `Config loading failed: ${actual.error?.message}`
            );

            if (actual.ok) {
                const rules = actual.config.rules;

                // Find rule "a"
                const ruleA = rules.find((rule) => rule.ruleId === "abc-with-severity/a");
                assert.ok(ruleA, "rule a should be loaded");

                if (ruleA && isObjectOptions(ruleA.options)) {
                    // Should preserve preset severity "warning" while adding user's "userOption" option
                    assert.strictEqual(
                        ruleA.options.severity,
                        "warning",
                        "Should preserve preset severity 'warning' for rule a"
                    );
                    assert.strictEqual(ruleA.options.userOption, true, "Should include user's userOption");
                    assert.strictEqual(ruleA.options.presetOption, "default", "Should preserve preset presetOption");
                }

                // Find rule "b"
                const ruleB = rules.find((rule) => rule.ruleId === "abc-with-severity/b");
                assert.ok(ruleB, "rule b should be loaded");

                if (ruleB && isObjectOptions(ruleB.options)) {
                    // Should preserve preset severity and other options while adding user's customOption
                    assert.strictEqual(
                        ruleB.options.severity,
                        "warning",
                        "Should preserve preset severity 'warning' for rule b"
                    );
                    assert.strictEqual(ruleB.options.customOption, "value", "Should include user's customOption");
                    assert.strictEqual(
                        ruleB.options.anotherPresetOption,
                        "value",
                        "Should preserve preset anotherPresetOption"
                    );
                }
            }
        });

        it("should handle boolean rule configurations correctly", async () => {
            const testConfig = {
                rules: {
                    "preset-abc-with-severity": {
                        c: false as const
                    }
                }
            };

            const rawConfig = {
                ...testConfig,
                plugins: [],
                filterRules: []
            };

            const actual = await loadPackagesFromRawConfig({
                rawConfig,
                node_moduleDir: modulesDir
            });

            assert.ok(actual.ok, "Config loading should succeed");

            if (actual.ok) {
                const rules = actual.config.rules;

                // The rule should be disabled (false), so it might not appear in the rules array
                // or appear with disabled status
                const ruleC = rules.find((rule) => rule.ruleId === "abc-with-severity/c");

                // Since the rule is set to false, it should either not be in the array
                // or have options set to false
                if (ruleC) {
                    assert.strictEqual(ruleC.options, false, "Rule should be disabled when set to false");
                }
            }
        });

        it("should preserve all preset options when user doesn't override", async () => {
            const testConfig = {
                rules: {
                    "preset-abc-with-severity": {}
                }
            };

            const rawConfig = {
                ...testConfig,
                plugins: [],
                filterRules: []
            };

            const actual = await loadPackagesFromRawConfig({
                rawConfig,
                node_moduleDir: modulesDir
            });

            assert.ok(actual.ok, "Config loading should succeed");

            if (actual.ok) {
                const rules = actual.config.rules;

                // All preset rules should preserve their original configurations
                const ruleA = rules.find((rule) => rule.ruleId === "abc-with-severity/a");
                const ruleB = rules.find((rule) => rule.ruleId === "abc-with-severity/b");

                if (ruleA && isObjectOptions(ruleA.options)) {
                    assert.strictEqual(ruleA.options.severity, "warning", "Should preserve preset severity for rule a");
                    assert.strictEqual(
                        ruleA.options.presetOption,
                        "default",
                        "Should preserve preset presetOption for rule a"
                    );
                }

                if (ruleB && isObjectOptions(ruleB.options)) {
                    assert.strictEqual(ruleB.options.severity, "warning", "Should preserve preset severity for rule b");
                    assert.strictEqual(
                        ruleB.options.anotherPresetOption,
                        "value",
                        "Should preserve preset anotherPresetOption for rule b"
                    );
                }
            }
        });
    });

    describe("edge cases", () => {
        it("should handle empty user options correctly", async () => {
            const testConfig = {
                rules: {
                    "preset-abc-with-severity": {
                        a: {},
                        b: {}
                    }
                }
            };

            const rawConfig = {
                ...testConfig,
                plugins: [],
                filterRules: []
            };

            const actual = await loadPackagesFromRawConfig({
                rawConfig,
                node_moduleDir: modulesDir
            });

            assert.ok(actual.ok, "Config loading should succeed");

            if (actual.ok) {
                const rules = actual.config.rules;

                // Rules with empty objects should use preset defaults
                const ruleA = rules.find((rule) => rule.ruleId === "abc-with-severity/a");
                const ruleB = rules.find((rule) => rule.ruleId === "abc-with-severity/b");

                if (ruleA && isObjectOptions(ruleA.options)) {
                    assert.strictEqual(
                        ruleA.options.severity,
                        "warning",
                        "Should use preset severity when user option is empty object"
                    );
                    assert.strictEqual(
                        ruleA.options.presetOption,
                        "default",
                        "Should preserve preset presetOption when user option is empty object"
                    );
                }

                if (ruleB && isObjectOptions(ruleB.options)) {
                    assert.strictEqual(
                        ruleB.options.severity,
                        "warning",
                        "Should use preset severity when user option is empty object"
                    );
                    assert.strictEqual(
                        ruleB.options.anotherPresetOption,
                        "value",
                        "Should preserve preset anotherPresetOption when user option is empty object"
                    );
                }
            }
        });
    });
});
