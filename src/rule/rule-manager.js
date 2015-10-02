// LICENSE : MIT
'use strict';
const loadRuleDir = require('./load-rules');
const objectAssign = require('object-assign');
// dictionary dictionary
/**
 * @typedef {{key: Function}} RulesObject
 */
/**
 * Defined all rules in this object.
 * @type {RulesObject}
 */
let rules = {};
function getAllRuleNames() {
    return Object.keys(rules);
}
/**
 * @returns {RulesObject}
 */
function getAllRules() {
    return rules;
}
function getRule(ruleKey) {
    return rules[ruleKey];
}
function isDefinedRule(ruleKey) {
    return getRule(ruleKey) != null;
}
/**
 *
 * @param {string} ruleDir ruleDir is rule directory.
 * @returns {RulesObject}
 */
function loadRules(ruleDir) {
    objectAssign(rules, loadRuleDir(ruleDir));
    return rules;
}
/**
 *
 * @param {string} ruleKey
 * @param ruleHandler
 */
function defineRule(ruleKey, ruleHandler) {
    rules[ruleKey] = ruleHandler;
}
function resetRules() {
    rules = Object.create(null);
}
module.exports = {
    getAllRuleNames: getAllRuleNames,
    getRule: getRule,
    getAllRules: getAllRules,
    loadRules: loadRules,
    defineRule: defineRule,
    isDefinedRule: isDefinedRule,
    resetRules: resetRules
};
