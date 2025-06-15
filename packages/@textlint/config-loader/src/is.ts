// TODO: share with @textlint/kernel
import type { TextlintRuleModule } from "@textlint/types";
import { TextlintConfigRulePreset } from "./TextlintConfigDescriptor.js";
import { TextlintFilterRuleReporter } from "@textlint/types";

/**
 * detect that ruleCreator has linter function
 * @param {*} ruleCreator
 * @returns {boolean}
 */
export function hasLinter(ruleCreator: any): boolean {
    if (!ruleCreator) {
        return false;
    }
    if (typeof ruleCreator.linter === "function") {
        return true;
    }
    if (typeof ruleCreator === "function") {
        return true;
    }
    return false;
}

/**
 * detect that ruleCreator has fixer function
 * @param {*} ruleCreator
 * @returns {boolean}
 */
export function hasFixer(ruleCreator: any): boolean {
    if (!ruleCreator) {
        return false;
    }
    return typeof ruleCreator.fixer === "function" && hasLinter(ruleCreator);
}

/**
 * is textlint rule module
 * type guard
 * @param mod
 */
export const isTextlintRuleModule = (mod: unknown): mod is TextlintRuleModule => {
    // it is same with isRuleModule() in @textlint/kernel
    return hasLinter(mod) || hasFixer(mod);
};
/**
 * is textlint filter rule reporter
 * type guard
 * @param mod
 */
export const isTextlintFilterRuleModule = (mod: unknown): mod is TextlintFilterRuleReporter => {
    return typeof mod === "function";
};

const hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * is textlint rule preset
 * type guard
 * @param mod
 */
export const isTextlintRulePresetCreator = (mod: unknown): mod is TextlintConfigRulePreset["preset"] => {
    return hasOwnProperty.call(mod, "rules") && hasOwnProperty.call(mod, "rulesConfig");
};
