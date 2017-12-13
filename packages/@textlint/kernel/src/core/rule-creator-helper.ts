// LICENSE : MIT
"use strict";
import {
    RuleCreatorReporter,
    TextlintRuleFixableCreator,
    TextlintFilterRuleCreator,
    TextlintRuleCreator
} from "../textlint-kernel-interface";

/**
 * detect that ruleCreator has linter function
 * @param {*} ruleCreator
 * @returns {boolean}
 */
export function hasLinter(ruleCreator: TextlintRuleCreator): boolean {
    if (typeof ruleCreator === "object" && typeof ruleCreator.linter === "function") {
        return true;
    }
    return typeof ruleCreator === "function";
}

/**
 * get linter function from ruleCreator
 * if not found, throw error
 * @param {Function|Object} ruleCreator
 * @returns {Function} linter function
 * @throws
 */
export function getLinter(ruleCreator: TextlintRuleCreator): RuleCreatorReporter {
    if (typeof ruleCreator === "object" && typeof ruleCreator.linter === "function") {
        return ruleCreator.linter;
    }
    if (typeof ruleCreator === "function") {
        return ruleCreator;
    }
    throw new Error("Not found linter function in the ruleCreator");
}

/**
 * detect that ruleCreator has fixer function
 * @param {*} ruleCreator
 * @returns {boolean}
 */
export function hasFixer(ruleCreator: TextlintRuleCreator): ruleCreator is TextlintRuleFixableCreator {
    return typeof ruleCreator === "object" && typeof ruleCreator.fixer === "function" && hasLinter(ruleCreator);
}

/**
 * get fixer function from ruleCreator
 * if not found, throw error
 * @param {Function|Object} ruleCreator
 * @returns {Function} fixer function
 * @throws
 */
export function getFixer(ruleCreator: TextlintRuleCreator) {
    if (!hasLinter(ruleCreator)) {
        throw new Error("fixer module should have also linter function.");
    }

    if (hasFixer(ruleCreator)) {
        return ruleCreator.fixer;
    }
    throw new Error("Not found fixer function in the ruleCreator");
}

/**
 * RuleModule should has either linter or fixer.
 * @param ruleCreator
 * @returns {boolean}
 **/
export function isRuleModule(ruleCreator: TextlintRuleCreator): boolean {
    return hasLinter(ruleCreator) || hasFixer(ruleCreator);
}

/**
 * Validate rule module.
 * if invalid throw error
 * @param {*} ruleModule
 * @param {string} key
 * @throws
 */
export function assertRuleShape(ruleModule: any, key = "") {
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
 * @returns {Function} linter function
 * @throws
 */
export function getFilter(ruleCreator: any): TextlintFilterRuleCreator {
    if (typeof ruleCreator === "function") {
        return ruleCreator;
    }
    throw new Error("Not found filter function in the ruleCreator");
}
