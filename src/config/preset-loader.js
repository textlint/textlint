// LICENSE : MIT
"use strict";
const interopRequire = require("interop-require");
const ObjectAssign = require("object-assign");
export function mapRulesConfig(rulesConfig, presetName) {
    const mapped = {};
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
/**
 *
 * @param ruleNames
 * @param {TextLintModuleResolver} moduleResolver
 * @returns {{}}
 */
export default function findRulesAndConfig(ruleNames = [], moduleResolver) {
    const presetRulesConfig = {};
    ruleNames.forEach(ruleName => {
        const pkgPath = moduleResolver.resolvePresetPackageName(ruleName);
        const preset = interopRequire(pkgPath);
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
