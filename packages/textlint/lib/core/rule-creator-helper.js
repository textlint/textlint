// LICENSE : MIT
"use strict";

/**
 * detect that ruleCreator has linter function
 * @param {*} ruleCreator
 * @returns {boolean}
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.hasLinter = hasLinter;
exports.getLinter = getLinter;
exports.hasFixer = hasFixer;
exports.getFixer = getFixer;
exports.isRuleModule = isRuleModule;
exports.assertRuleShape = assertRuleShape;
exports.getFilter = getFilter;
function hasLinter(ruleCreator) {
    if (typeof ruleCreator.linter === "function") {
        return true;
    }
    if (typeof ruleCreator === "function") {
        return true;
    }
}
/**
 * get linter function from ruleCreator
 * if not found, throw error
 * @param {Function|Object} ruleCreator
 * @returns {Function} linter function
 * @throws
 */
function getLinter(ruleCreator) {
    if (typeof ruleCreator.linter === "function") {
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
function hasFixer(ruleCreator) {
    return typeof ruleCreator.fixer === "function" && hasLinter(ruleCreator);
}
/**
 * get fixer function from ruleCreator
 * if not found, throw error
 * @param {Function|Object} ruleCreator
 * @returns {Function} fixer function
 * @throws
 */
function getFixer(ruleCreator) {
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
function isRuleModule(ruleCreator) {
    return hasLinter(ruleCreator) || hasFixer(ruleCreator);
}

/**
 * Validate rule module.
 * if invalid throw error
 * @param {*} ruleModule
 * @param {string} key
 * @throws
 */
function assertRuleShape(ruleModule) {
    var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

    if (ruleModule === undefined) {
        throw new Error("Definition of rule '" + key + "' was not found.");
    }
    /*
    Check old rule function
    module.exports = function(context){
     }
    */
    if (!isRuleModule(ruleModule)) {
        throw new Error("Definition of rule '" + key + "' was not rule module.\nRule should export function:\nmodule.exports = function(context){\n    // Your rule\n};");
    }
}

/**
 * get linter function from ruleCreator
 * if not found, throw error
 * @param {*} ruleCreator
 * @returns {Function} linter function
 * @throws
 */
function getFilter(ruleCreator) {
    if (typeof ruleCreator === "function") {
        return ruleCreator;
    }
    throw new Error("Not found filter function in the ruleCreator");
}
//# sourceMappingURL=rule-creator-helper.js.map