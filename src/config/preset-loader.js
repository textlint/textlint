// LICENSE : MIT
"use strict";
const interopRequire = require("interop-require");
const ObjectAssign = require("object-assign");
import TextLintModuleMapper from "../engine/textlint-module-mapper";

/**
 * create `<plugin>/<rule>` option
 * @param {Object} [rulesConfig]
 * @param {string} presetName
 * @returns {Object}
 */
export function mapRulesConfig(rulesConfig, presetName) {
    const mapped = {};
    // missing "rulesConfig"
    if (rulesConfig === undefined || typeof rulesConfig !== "object") {
        return mapped;
    }
    return TextLintModuleMapper.createMappedObject(rulesConfig, presetName);
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
