import {
    normalizeFilterRuleKey,
    normalizePluginKey,
    normalizePresetSubRuleKey,
    normalizeRuleKey,
    normalizeRulePresetKey
} from "../../src/config/config-key-normalizer";
import * as assert from "assert";

type NormalizeFunction = (name: string) => string;
const checkPatterns = (normalizeFunction: NormalizeFunction, patterns: { before: string; after: string }[]) => {
    patterns.forEach(pattern => {
        it(`${pattern.before} -> ${pattern.after}`, () => {
            assert.strictEqual(normalizeFunction(pattern.before), pattern.after);
        });
    });
};

describe("config-key-normalizer", function() {
    describe("preset and rule", () => {
        const patterns = [
            {
                preset: "textlint-rule-preset-<parent>",
                rule: "textlint-rule-<child>",
                result: "<parent>/<child>"
            },
            {
                preset: "preset-<parent>",
                rule: "textlint-rule-<child>",
                result: "<parent>/<child>"
            },
            {
                preset: "<parent>",
                rule: "textlint-rule-<child>",
                result: "<parent>/<child>"
            },
            {
                preset: "<parent>",
                rule: "<child>",
                result: "<parent>/<child>"
            },
            // scope
            {
                preset: "@org/textlint-rule-preset-<parent>",
                rule: "@org/textlint-rule-<child>",
                result: "@org/<parent>/@org/<child>"
            },
            {
                preset: "@org/preset-<parent>",
                rule: "@org/textlint-rule-<child>",
                result: "@org/<parent>/@org/<child>"
            },
            {
                preset: "@org/<parent>",
                rule: "@org/textlint-rule-<child>",
                result: "@org/<parent>/@org/<child>"
            },
            {
                preset: "@org/<parent>",
                rule: "@org/<child>",
                result: "@org/<parent>/@org/<child>"
            },
            {
                preset: "@org/<parent>",
                rule: "<child>",
                result: "@org/<parent>/<child>"
            }
        ];
        patterns.forEach(pattern => {
            it(`${pattern.preset}/${pattern.rule} -> ${pattern.result}`, () => {
                assert.strictEqual(
                    normalizePresetSubRuleKey({
                        preset: pattern.preset,
                        rule: pattern.rule
                    }),
                    pattern.result
                );
            });
        });
    });
    describe("rule", () => {
        checkPatterns(normalizeRuleKey, [
            {
                before: "textlint-rule-<name>",
                after: "<name>"
            },
            {
                before: "<name>",
                after: "<name>"
            },
            {
                before: "@scope/textlint-rule-<name>",
                after: "@scope/<name>"
            }
        ]);
    });
    describe("preset", () => {
        checkPatterns(normalizeRulePresetKey, [
            {
                before: "textlint-rule-preset-<name>",
                after: "<name>"
            },
            {
                before: "preset-<name>",
                after: "<name>"
            },
            {
                before: "@scope/textlint-rule-preset-<name>",
                after: "@scope/<name>"
            },
            {
                before: "@scope/preset-<name>",
                after: "@scope/<name>"
            },
            {
                before: "@scope/textlint-rule-<name>",
                after: "@scope/textlint-rule-<name>"
            }
        ]);
    });
    describe("filter", () => {
        checkPatterns(normalizeFilterRuleKey, [
            {
                before: "textlint-filter-rule-<name>",
                after: "<name>"
            },
            {
                before: "<name>",
                after: "<name>"
            },
            {
                before: "@scope/textlint-filter-rule-<name>",
                after: "@scope/<name>"
            },
            {
                before: "@scope/foo-<name>",
                after: "@scope/foo-<name>"
            }
        ]);
    });
    // plugin
    describe("plugin", () => {
        checkPatterns(normalizePluginKey, [
            {
                before: "textlint-plugin-<name>",
                after: "<name>"
            },
            {
                before: "<name>",
                after: "<name>"
            },
            {
                before: "@scope/textlint-plugin-<name>",
                after: "@scope/<name>"
            },
            {
                before: "@scope/foo-<name>",
                after: "@scope/foo-<name>"
            }
        ]);
    });
});
