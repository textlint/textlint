import type { TextlintFilterRuleReporter, TextlintRuleReporter } from "@textlint/types";

// Type guards
function isObjectWithProperty(obj: unknown, property: string): obj is Record<string, unknown> {
    return typeof obj === "object" && obj !== null && property in obj;
}

function hasLinterProperty(obj: unknown): obj is { linter: unknown } {
    return isObjectWithProperty(obj, "linter");
}

function hasFixerProperty(obj: unknown): obj is { fixer: unknown } {
    return isObjectWithProperty(obj, "fixer");
}

/**
 * detect that ruleCreator has linter function
 * @param {*} ruleCreator
 * @returns {boolean}
 */
export function hasLinter(ruleCreator: unknown): boolean {
    if (hasLinterProperty(ruleCreator) && typeof ruleCreator.linter === "function") {
        return true;
    }
    if (typeof ruleCreator === "function") {
        return true;
    }
    return false;
}

/**
 * get linter function from ruleCreator
 * if not found, throw error
 * @param {((...args: any[]) => any)|Object|any} ruleCreator
 * @returns {(...args: any[]) => any} linter function
 * @throws
 */
export function getLinter(ruleCreator: unknown): TextlintRuleReporter {
    if (hasLinterProperty(ruleCreator) && typeof ruleCreator.linter === "function") {
        return ruleCreator.linter as TextlintRuleReporter;
    }
    if (typeof ruleCreator === "function") {
        return ruleCreator as TextlintRuleReporter;
    }
    throw new Error("Not found linter function in the ruleCreator");
}

/**
 * detect that ruleCreator has fixer function
 * @param {*} ruleCreator
 * @returns {boolean}
 */
export function hasFixer(ruleCreator: unknown): boolean {
    return hasFixerProperty(ruleCreator) && typeof ruleCreator.fixer === "function" && hasLinter(ruleCreator);
}

/**
 * get fixer function from ruleCreator
 * if not found, throw error
 * @param {((...args: any[]) => any)|Object|any} ruleCreator
 * @returns {(...args: any[]) => any} fixer function
 * @throws
 */
export function getFixer(ruleCreator: unknown): TextlintRuleReporter {
    if (!hasLinter(ruleCreator)) {
        throw new Error("fixer module should have also linter function.");
    }
    if (hasFixerProperty(ruleCreator) && typeof ruleCreator.fixer === "function") {
        return ruleCreator.fixer as TextlintRuleReporter;
    }
    throw new Error("Not found fixer function in the ruleCreator");
}

/**
 * RuleModule should has either linter or fixer.
 * @param {*} ruleCreator
 * @returns {boolean}
 **/
export function isRuleModule(ruleCreator: unknown): boolean {
    return hasLinter(ruleCreator) || hasFixer(ruleCreator);
}

/**
 * Validate rule module.
 * if invalid throw error
 * @param {*} ruleModule
 * @param {string} [key]
 * @throws
 */
export function assertRuleShape(ruleModule: unknown, key: string = "") {
    if (ruleModule === undefined) {
        throw new Error(`Definition of rule '${key}' was not found.`);
    }
    /*
    Check old rule function
    module.exports = function(context){

    }
    */
    if (!isRuleModule(ruleModule)) {
        throw new Error(`Definition of rule '${key}' was not rule module.
Rule should export function:
module.exports = function(context){
    // Your rule
};`);
    }
}

/**
 * get linter function from ruleCreator
 * if not found, throw error
 * @param {*} ruleCreator
 * @returns {(...args: any[]) => any} linter function
 * @throws
 */
export function getFilter(ruleCreator: unknown): TextlintFilterRuleReporter {
    if (typeof ruleCreator === "function") {
        return ruleCreator as TextlintFilterRuleReporter;
    }
    throw new Error("Not found filter function in the ruleCreator");
}
