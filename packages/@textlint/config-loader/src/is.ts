// TODO: share with @textlint/kernel
import type { TextlintRuleModule } from "@textlint/types";
import { TextlintConfigRulePreset } from "./TextlintConfigDescriptor";
import { TextlintFilterRuleReporter } from "@textlint/types";

/**
 * detect that ruleCreator has linter function
 * @param {*} ruleCreator
 * @returns {boolean}
 */
export function hasLinter(ruleCreator: any): boolean {
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
function hasFixer(ruleCreator: any): boolean {
    return typeof ruleCreator.fixer === "function" && hasLinter(ruleCreator);
}

export const isTextlintRuleModule = (mod: unknown): mod is TextlintRuleModule => {
    // it is same with isRuleModule() in @textlint/kernel
    return hasLinter(mod) || hasFixer(mod);
};

const hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * Check if the given value is a preset object
 * @param mod
 */
export const isPresetCreator = (mod: unknown): mod is TextlintConfigRulePreset["preset"] => {
    return hasOwnProperty.call(mod, "rules") && hasOwnProperty.call(mod, "rulesConfig");
};

export const isTextlintFilterRuleReporter = (mod: unknown): mod is TextlintFilterRuleReporter => {
    return typeof mod === "function";
};
