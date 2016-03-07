// LICENSE : MIT
"use strict";
const interopRequire = require("interop-require");
const tryResolve = require("try-resolve");
const ObjectAssign = require("object-assign");
const path = require("path");
export function mapRulesConfig(rulesConfig, presetName) {
    let mapped = {};
    if (rulesConfig === undefined) {
        return mapped;
    }
    // ignore "preset-foo": false
    if (typeof rulesConfig !== "object") {
        return mapped;
    }
    Object.keys(rulesConfig).forEach(key => {
        mapped[`${presetName}/${key}`] = rulesConfig[key];
    });
    return mapped;
}
// load rulesConfig from plugins
export default function findRulesAndConfig(ruleNames = [], {
    baseDir = ".",
    rulePrefix
    }) {
    let presetRulesConfig = {};
    ruleNames.forEach(ruleName => {
        const textlintRuleName = `${rulePrefix}${ ruleName }`;
        const pkgPath = tryResolve(path.join(baseDir, textlintRuleName)) || tryResolve(path.join(baseDir, ruleName));
        if (!pkgPath) {
            throw new ReferenceError(`${ ruleName } is not found`);
        }
        var preset = interopRequire(pkgPath);
        if (!preset.hasOwnProperty("rules")) {
            throw new Error(`${ruleName} has not rules`);
        }
        if (!preset.hasOwnProperty("rulesConfig")) {
            throw new Error(`${ruleName} has not rulesConfig`);
        }
        // set config of <rule> to "<preset>/<rule>"
        ObjectAssign(presetRulesConfig, mapRulesConfig(preset.rulesConfig, ruleName));
    });
    return presetRulesConfig;
}
