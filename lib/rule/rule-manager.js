// LICENSE : MIT
"use strict";

var loadRuleDir = require("./load-rules");
var objectAssign = require("object-assign");
// dictionary dictionary
var rules = Object.create(null);
function getAllRuleNames() {
    return Object.keys(rules);
}
function getAllRules() {
    return rules;
}
function getRule(ruleKey) {
    return rules[ruleKey];
}
function loadRules(ruleDir) {
    objectAssign(rules, loadRuleDir(ruleDir));
    return rules;
}
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
    resetRules: resetRules
};