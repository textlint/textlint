// LICENSE : MIT
"use strict";
const assert = require("assert");
/**
 * Validate rule module.
 * if invalid throw error
 * @param {any} ruleModule
 * @param {string} key
 */
export function assertRuleShape(ruleModule, key = "") {
    if (ruleModule === undefined) {
        throw new Error(`Definition of rule '${ key }' was not found.`);
    }
    /*
    Check old rule function
    module.exports = function(context){

    }
    */
    if (typeof ruleModule !== "function") {
        if (typeof ruleModule.fixer !== "function" || typeof ruleModule.linter !== "function") {
            throw new Error(`Definition of rule '${ key }' was not found.
Rule should export function:
module.exports = function(context){
    // Your rule
};`);
        }
    }
}
/**
 * get linter function from ruleCreator
 * if not found, throw error
 * @param {any} ruleCreator
 * @returns {Function} linter function
 */
export function getLinter(ruleCreator) {
    if (typeof ruleCreator.linter === "function") {
        return ruleCreator.linter;
    }
    if (typeof ruleCreator === "function") {
        return ruleCreator;
    }
    throw new Error(`Not found linter function in the ruleCreator`);
}
/**
 * get fixer function from ruleCreator
 * if not found, throw error
 * @param {any} ruleCreator
 * @returns {Function} fixer function
 */
export function getFixer(ruleCreator) {
    if (typeof ruleCreator.fixer === "function") {
        return ruleCreator.fixer;
    }
    if (typeof ruleCreator === "function") {
        return ruleCreator;
    }
    throw new Error(`Not found fixer function in the ruleCreator`);
}