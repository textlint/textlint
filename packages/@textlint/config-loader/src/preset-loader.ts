// LICENSE : MIT
import { moduleInterop } from "@textlint/module-interop";
import { TextLintModuleResolver } from "./textlint-module-resolver";
import { normalizeTextlintPresetSubRuleKey } from "@textlint/utils";
import { isPresetRuleKey } from "./config-util";
import { TextlintConfigDescriptor } from "./TextlintConfigDescriptor";
import { TextlintRcConfig } from "./TextlintRcConfig";

/**
 * Convert config of preset to rawRulesConfig flat path format.
 *
 * This function convert Preset nesting rule to flat path
 * ```
 * {
 *  "x" : true
 *  "preset-a" : { "rule-name": "value" }
 * }
 * ```
 * =>
 * ```
 * { "x": true }
 * { "a/rule-name": "value" }
 * ```
 *
 * @param rawRulesConfig
 * @returns {{string: string}}
 */
export function createFlatRulesConfigFromRawRulesConfig(rawRulesConfig: any) {
    if (!rawRulesConfig) {
        return {};
    }
    const rulesConfig: { [index: string]: any } = {};
    Object.keys(rawRulesConfig).forEach((key) => {
        if (isPresetRuleKey(key)) {
            // <preset>/<rule>
            const presetName = key;
            const presetRuleConfig = rawRulesConfig[key];
            Object.assign(
                rulesConfig,
                createFlatPresetRulesConfigFromRawPresetRuleConfig(presetRuleConfig, presetName)
            );
            return;
        }
        rulesConfig[key] = rawRulesConfig[key];
    });
    return rulesConfig;
}

/**
 * create flat `<plugin>/<rule>` option
 * @param {Object} [rulesConfig]
 * @param {string} presetName
 * @returns {Object}
 */
export function createFlatPresetRulesConfigFromRawPresetRuleConfig(
    rulesConfig: { [index: string]: string },
    presetName: string
): object {
    const mapped: { [index: string]: string } = {};
    // missing "rulesConfig"
    if (rulesConfig === undefined || typeof rulesConfig !== "object") {
        return mapped;
    }
    Object.keys(rulesConfig).forEach((ruleName) => {
        const normalizedKey = normalizeTextlintPresetSubRuleKey({ preset: presetName, rule: ruleName });
        mapped[normalizedKey] = rulesConfig[ruleName];
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
export function loadRulesConfigFromPresets(
    presetNames: string[] = [],
    moduleResolver: TextLintModuleResolver
): {
    [index: string]: boolean | {};
} {
    const presetRulesConfig: {
        [index: string]: boolean | {};
    } = {};
    presetNames.forEach((presetName) => {
        const presetPackageName = moduleResolver.resolvePresetPackageName(presetName);
        const preset = moduleInterop(require(presetPackageName.filePath));
        if (!preset.hasOwnProperty("rules")) {
            throw new Error(`${presetName} has not rules`);
        }
        if (!preset.hasOwnProperty("rulesConfig")) {
            throw new Error(`${presetName} has not rulesConfig`);
        }
        // set config of <rule> to "<preset>/<rule>"
        Object.assign(
            presetRulesConfig,
            createFlatPresetRulesConfigFromRawPresetRuleConfig(preset.rulesConfig, presetName)
        );
    });
    return presetRulesConfig;
}

export function loadPreset({
    presetName,
    presetRulesOptions,
    moduleResolver
}: {
    presetName: string;
    presetRulesOptions: NonNullable<TextlintRcConfig["rules"]>;
    moduleResolver: TextLintModuleResolver;
}): TextlintConfigDescriptor["rules"] {
    const presetPackageName = moduleResolver.resolvePresetPackageName(presetName);
    const preset = moduleInterop(require(presetPackageName.filePath));
    if (!preset.hasOwnProperty("rules")) {
        throw new Error(`${presetName} has not rules`);
    }
    if (!preset.hasOwnProperty("rulesConfig")) {
        throw new Error(`${presetName} has not rulesConfig`);
    }
    // we should use preset.rules → some preset use different name actual rule
    return Object.keys(preset.rules).map((ruleId) => {
        const normalizedKey = normalizeTextlintPresetSubRuleKey({ preset: presetName, rule: ruleId });
        return {
            ruleId: normalizedKey,
            rule: preset.rules[ruleId],
            options: presetRulesOptions[ruleId] ?? preset.rulesConfig[ruleId],
            filePath: presetPackageName.filePath,
            moduleName: presetPackageName.moduleName
        };
    });
}
