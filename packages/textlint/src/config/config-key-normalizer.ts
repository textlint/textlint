/**
 * @overview config-key-normalizer provide normalize function for `key`
 * It aim to normalize key and  use it for {rule,filterRule,plugin}'s config.
 *
 * ### Key normalization algorithm
 *
 * - Any package path -> full path
 *
 * **key**: key is normalized string for resolving {rule,filterRule,plugin} option.
 *
 * The key is shorten by design.
 *
 * For example, `@org/textlint-rule-preset-parent`'s `@org/textlint-rule-child` key is `@org/parent/@org/child`.
 *
 * `@org/textlint-rule-preset-parent`'s `@org/textlint-rule-child`:
 * ```json
 * {
 *  "rules": {
 *    "@org/textlint-rule-preset-parent": {
 *       "@org/textlint-rule-child": true
 *    }
 *  }
 *}
 * ```
 *
 * In internal, this config is normalized to following:
 *
 * ```
 * { @org/parent/@org/child: true }
 * ```
 *
 * For more details, see textlint-package-name-util-test.ts
 *
 * **Related:**
 *
 * - <https://github.com/textlint/textlint/issues/583>
 * - <https://github.com/textlint/textlint/pull/586>
 *
 * **Not Related:**
 *
 * Package prefix name is similar with this key algorithm.
 * But, it is not shared this algorithm.
 * It is just prefix(shortcut name).
 *
 * For more details, see package-prefix.ts and textlint-module-resolver.ts
 *
 * @example
 *
 * - textlint-config-<name> -> <name>
 * - textlint-rule-<name> -> <name>
 * - textlint-rule-preset-<name> -> <name>
 * - preset-<name> -> <name>
 *
 *
 */
import { PackageNamePrefix } from "./package-prefix";
import { removePrefixFromPackageName } from "../engine/textlint-package-name-util";

// @org/preset/@org/rule
const patternOrgXOrg = /^(@.*?\/.*?)\/(@.*?\/.*?)$/;
// @org/preset/rule
const patternOrgXRule = /^(@.*?\/.*?)\/(.*?)$/;
// preset/@org/rule
const patternPresetXOrg = /^(.*?)\/(@.*?)$/;
// preset/rule
const patternPresetXRule = /^([^@].*?)\/(.*?)$/;
/**
 * split "preset/rule" string to {preset, rule}
 */
export const splitKeyToPresetSubRule = (name: string): { preset: string | null; rule: string } => {
    const patternList = [patternOrgXOrg, patternOrgXRule, patternPresetXOrg, patternPresetXRule];
    for (let i = 0; i < patternList.length; i++) {
        const pattern = patternList[i];
        const result = name.match(pattern);
        if (!result) {
            continue;
        }
        return { preset: result[1], rule: result[2] };
    }
    // Other case is a single rule
    // @org/rule or rule
    return {
        preset: null,
        rule: name
    };
};
/**
 * normalize `keyPath` that is specific path for rule
 * This normalize function handle ambiguity `key`
 * `keyPath` is one of "preset/rule` key, or "rule" key
 * @param keyPath
 */
export const normalizeKeyPath = (keyPath: string) => {
    const { preset, rule } = splitKeyToPresetSubRule(keyPath);
    if (!preset) {
        return normalizeRuleKey(rule);
    }
    return `${normalizeRulePresetKey(preset)}/${normalizeRuleKey(rule)}`;
};
/**
 * Normalize preset-name/rule-name
 */
export const normalizePresetSubRuleKey = (names: { preset: string; rule: string }) => {
    const { preset, rule } = names;
    return `${normalizeRulePresetKey(preset)}/${normalizeRuleKey(rule)}`;
};
export const normalizeRuleKey = (name: string) => {
    return removePrefixFromPackageName([PackageNamePrefix.rule], name);
};
export const normalizeFilterRuleKey = (name: string) => {
    return removePrefixFromPackageName([PackageNamePrefix.filterRule], name);
};
export const normalizeRulePresetKey = (name: string) => {
    // "preset-<name>" and "textlint-rule-preset-"
    return removePrefixFromPackageName([PackageNamePrefix.rulePreset, "preset-"], name);
};
export const normalizePluginKey = (name: string) => {
    return removePrefixFromPackageName([PackageNamePrefix.plugin], name);
};
