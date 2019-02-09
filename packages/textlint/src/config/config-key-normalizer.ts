/**
 * @overview config-key-normalizer provide normalize function for `key`
 * It aim to normalize key and  use it for {rule,filterRule,plugin}'s config.
 *
 * @example
 *
 * - textlint-config-<name> -> <name>
 * - textlint-rule-<name> -> <name>
 * - textlint-rule-preset-<name> -> <name>
 * - preset-<name> -> <name>
 *
 *  For more details, see textlint-package-name-util-test.ts
 */
import { PackageNamePrefix } from "./pacakge-prefix";
import { removePrefixFromPackageName } from "../engine/textlint-package-name-util";

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
