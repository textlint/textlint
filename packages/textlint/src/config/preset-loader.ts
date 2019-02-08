// LICENSE : MIT
"use strict";
import { TextLintModuleResolver } from "../engine/textlint-module-resolver";
import { normalizeRuleKey, normalizeRulePresetKey } from "./config-key-normalizer";
import { isPresetRuleKey } from "../util/config-util";
const interopRequire = require("interop-require");
const ObjectAssign = require("object-assign");

/**
 * Convert config of preset to rulesConfig flat path format.
 *
 * e.g.)
 * {
 *  "preset-a" : { "key": "value"}
 * }
 * => {"preset-a/key": "value"}
 *
 * @param rulesConfig
 * @returns {{string: string}}
 */
export function convertRulesConfigToFlatPath(rulesConfig: any) {
    if (!rulesConfig) {
        return {};
    }
    const filteredConfig: { [index: string]: any } = {};
    Object.keys(rulesConfig).forEach(key => {
        if (isPresetRuleKey(key)) {
            // <preset>/<rule>
            ObjectAssign(filteredConfig, mapRulesConfig(rulesConfig[key], key));
            return;
        }
        filteredConfig[key] = rulesConfig[key];
    });
    return filteredConfig;
}

/**
 * create `<plugin>/<rule>` option
 * @param {Object} [rulesConfig]
 * @param {string} presetName
 * @returns {Object}
 */
export function mapRulesConfig(rulesConfig: { [index: string]: string }, presetName: string): object {
    const mapped: { [index: string]: string } = {};
    // missing "rulesConfig"
    if (rulesConfig === undefined || typeof rulesConfig !== "object") {
        return mapped;
    }
    Object.keys(rulesConfig).forEach(ruleName => {
        mapped[`${normalizeRulePresetKey(presetName)}/${normalizeRuleKey(ruleName)}`] = rulesConfig[ruleName];
    });
    return mapped;
}

// load rulesConfig from plugins
/**
 *
 * @param presetNames
 * @param {TextLintModuleResolver} moduleResolver
 * @returns {{}}
 */
export function loadRulesConfigFromPresets(presetNames: string[] = [], moduleResolver: TextLintModuleResolver): {} {
    const presetRulesConfig = {};
    presetNames.forEach(presetName => {
        const pkgPath = moduleResolver.resolvePresetPackageName(presetName);
        const preset = interopRequire(pkgPath);
        if (!preset.hasOwnProperty("rules")) {
            throw new Error(`${presetName} has not rules`);
        }
        if (!preset.hasOwnProperty("rulesConfig")) {
            throw new Error(`${presetName} has not rulesConfig`);
        }
        // set config of <rule> to "<preset>/<rule>"
        ObjectAssign(presetRulesConfig, mapRulesConfig(preset.rulesConfig, presetName));
    });
    return presetRulesConfig;
}
