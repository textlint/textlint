import { PackageNamePrefix } from "./pacakge-prefix";
import { removePrefixFromPackageName } from "../engine/textlint-package-name-util";

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
