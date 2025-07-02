import { TextLintModuleResolver } from "./textlint-module-resolver.js";
import { isPresetRuleKey } from "./config-util.js";
import { TextlintRcConfig } from "./TextlintRcConfig.js";
import { moduleInterop } from "@textlint/module-interop";
import { TextlintConfigDescriptor } from "./TextlintConfigDescriptor.js";
import { TextlintPluginCreator } from "@textlint/types";
import { isTextlintRulePresetCreator, isTextlintFilterRuleModule, isTextlintRuleModule } from "./is.js";
import { normalizeTextlintPresetSubRuleKey } from "@textlint/utils";
import { dynamicImport } from "@textlint/resolver";

const isPluginCreator = (mod: unknown): mod is TextlintPluginCreator => {
    return typeof mod === "object" && mod !== null && Object.prototype.hasOwnProperty.call(mod, "Processor");
};
export const loadPlugins = async ({
    pluginsObject,
    moduleResolver,
    testReplaceDefinitions
}: {
    pluginsObject: NonNullable<TextlintRcConfig["plugins"]>;
    parentPresetName?: string;
    moduleResolver: TextLintModuleResolver;
    testReplaceDefinitions?: TextlintConfigDescriptor["plugins"];
}): Promise<{
    plugins: TextlintConfigDescriptor["plugins"];
    pluginsError: null | {
        message: string;
        errors: Error[];
    };
}> => {
    const plugins: TextlintConfigDescriptor["plugins"] = [];
    const pluginErrors: Error[] = [];
    if (Array.isArray(pluginsObject)) {
        // { plugins: ["a", "b"] }
        await Promise.all(
            pluginsObject.map(async (pluginId) => {
                const resolvedModule = moduleResolver.resolvePluginPackageName(pluginId);
                const mod = await dynamicImport(resolvedModule.filePath, {
                    parentModule: "config-loader"
                });
                const plugin = moduleInterop(mod.exports?.default);
                if (!isPluginCreator(plugin)) {
                    pluginErrors.push(
                        new Error(`Plugin should be object that has "Processor" property. But "${pluginId}" is not.

Please check "${pluginId}" is valid plugin.
FilePath: ${resolvedModule.filePath}

For more details, See FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md
`)
                    );
                    return;
                }
                plugins.push({
                    type: "Plugin",
                    pluginId,
                    plugin,
                    filePath: resolvedModule.filePath,
                    moduleName: resolvedModule.moduleName,
                    inputModuleName: resolvedModule.inputModuleName
                });
            })
        );
    } else {
        // { plugins: { "a": true, "b": options } }
        await Promise.all(
            Object.entries(pluginsObject).map(async ([pluginId, pluginOptions]) => {
                try {
                    // Test Replace logic
                    const replacedDefinition =
                        testReplaceDefinitions &&
                        testReplaceDefinitions.find((definition) => {
                            return definition.pluginId === pluginId;
                        });
                    if (replacedDefinition) {
                        // for debug
                        plugins.push(replacedDefinition);
                    } else {
                        const resolvedPlugin = moduleResolver.resolvePluginPackageName(pluginId);
                        const mod = await dynamicImport(resolvedPlugin.filePath, {
                            parentModule: "config-loader"
                        });
                        const plugin = moduleInterop(mod.exports?.default);
                        if (!isPluginCreator(plugin)) {
                            pluginErrors.push(
                                new Error(`Plugin should be object that has "Processor" property. But "${pluginId}" is not.

Please check "${pluginId}" is valid plugin.
FilePath: ${resolvedPlugin.filePath}

For more details, See FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md
`)
                            );
                            return;
                        }

                        plugins.push({
                            type: "Plugin",
                            pluginId,
                            plugin,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            options: pluginOptions as any,
                            filePath: resolvedPlugin.filePath,
                            moduleName: resolvedPlugin.moduleName,
                            inputModuleName: resolvedPlugin.inputModuleName
                        });
                    }
                } catch (error) {
                    pluginErrors.push(error as Error);
                }
            })
        );
    }
    return {
        plugins,
        pluginsError:
            pluginErrors.length === 0
                ? null
                : {
                      message: "Can not load plugin",
                      errors: pluginErrors
                  }
    };
};
export const loadFilterRules = async ({
    rulesObject,
    moduleResolver,
    testReplaceDefinitions
}: {
    rulesObject: NonNullable<TextlintRcConfig["filters"]>;
    moduleResolver: TextLintModuleResolver;
    testReplaceDefinitions?: TextlintConfigDescriptor["filterRules"];
}): Promise<{
    filterRules: TextlintConfigDescriptor["filterRules"];
    filterRulesError: null | {
        message: string;
        errors: Error[];
    };
}> => {
    // rules
    const rules: TextlintConfigDescriptor["filterRules"] = [];
    const ruleErrors: Error[] = [];
    await Promise.all(
        Object.entries(rulesObject).map(async ([ruleId, ruleOptions]) => {
            try {
                // Test Replace logic
                const replacedDefinition =
                    testReplaceDefinitions &&
                    testReplaceDefinitions.find((definition) => {
                        return definition.ruleId === ruleId;
                    });
                if (replacedDefinition) {
                    // for debug
                    rules.push(replacedDefinition);
                } else {
                    const resolvePackage = moduleResolver.resolveFilterRulePackageName(ruleId);
                    const mod = await dynamicImport(resolvePackage.filePath, {
                        parentModule: "config-loader"
                    });
                    const ruleModule = moduleInterop(mod.exports?.default);
                    if (!isTextlintFilterRuleModule(ruleModule)) {
                        ruleErrors.push(
                            new Error(`Filter rule should be object that has "filter" property. But ${ruleId} is not.`)
                        );
                        return;
                    }
                    // rule
                    rules.push({
                        ruleId,
                        rule: ruleModule,
                        options: ruleOptions,
                        filePath: resolvePackage.filePath,
                        moduleName: resolvePackage.moduleName,
                        inputModuleName: resolvePackage.inputModuleName
                    });
                }
            } catch (error) {
                ruleErrors.push(error as Error);
            }
        })
    );
    return {
        filterRules: rules,
        filterRulesError:
            ruleErrors.length === 0
                ? null
                : {
                      message: "Can not load filter rule",
                      errors: ruleErrors
                  }
    };
};

export const loadRules = async ({
    rulesObject,
    moduleResolver,
    testReplaceDefinitions
}: {
    rulesObject: NonNullable<TextlintRcConfig["rules"]>;
    moduleResolver: TextLintModuleResolver;
    testReplaceDefinitions?: TextlintConfigDescriptor["rules"];
}): Promise<{
    rules: TextlintConfigDescriptor["rules"];
    rulesError: null | {
        message: string;
        errors: Error[];
    };
}> => {
    // rules
    const rules: TextlintConfigDescriptor["rules"] = [];
    const ruleErrors: Error[] = [];
    await Promise.all(
        Object.entries(rulesObject).map(async ([ruleId, ruleOptions]) => {
            try {
                // Test Replace logic
                const replacedDefinition =
                    testReplaceDefinitions &&
                    testReplaceDefinitions.find((definition) => {
                        return definition.ruleId === ruleId;
                    });
                // if rule is disabled, skip to load
                if (!ruleOptions) {
                    return;
                }
                if (replacedDefinition) {
                    // for debug
                    rules.push(replacedDefinition);
                } else {
                    if (isPresetRuleKey(ruleId)) {
                        // load preset
                        const presetRulesOptions = typeof ruleOptions === "boolean" ? {} : (ruleOptions as Record<string, boolean | object>);
                        const rulesInPreset = await loadPreset({
                            presetName: ruleId,
                            presetRulesOptions,
                            moduleResolver
                        });
                        rules.push(...rulesInPreset);
                    } else {
                        // load rule
                        const resolvePackage = moduleResolver.resolveRulePackageName(ruleId);
                        const mod = await dynamicImport(resolvePackage.filePath, {
                            parentModule: "config-loader"
                        });
                        const ruleModule = moduleInterop(mod.exports?.default);
                        if (!isTextlintRuleModule(ruleModule)) {
                            ruleErrors.push(
                                new Error(`Rule should have "rules" and "rulesConfig" properties. But ${ruleId} is not.
                        
Please check ${ruleId} is valid rule.
FilePath: ${resolvePackage.filePath}

For more details, See FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md                        
`)
                            );
                            return;
                        }
                        // rule
                        rules.push({
                            type: "Rule",
                            ruleId,
                            rule: ruleModule,
                            options: ruleOptions,
                            filePath: resolvePackage.filePath,
                            moduleName: resolvePackage.moduleName,
                            inputModuleName: resolvePackage.inputModuleName
                        });
                    }
                }
            } catch (error) {
                ruleErrors.push(error as Error);
            }
        })
    );
    return {
        rules,
        rulesError:
            ruleErrors.length === 0
                ? null
                : {
                      message: "Can not load rule",
                      errors: ruleErrors
                  }
    };
};
/**
 * prefer .textlintrc config than preset.rulesConfig
 * Do not merge configs - user config takes complete precedence when provided
 *
 * Rule otions priority:
 * 1. If userRuleConfig is defined, use user config
 * 2. If userRuleConfig is false, use user config - the rule is disabled
 * 3. If presetRuleConfig is true or presetRulesOptions[ruleKey] is not false, use preset config
 *    - If presetRulesOptions[ruleKey] is false by default, user can enable the rule by setting it to true
 **/
const getRuleOptions = ({
    userRuleConfig,
    presetRulesConfig
}: {
    userRuleConfig: Record<string, unknown> | boolean;
    presetRulesConfig: Record<string, unknown> | boolean;
}) => {
    // If user config is false, the rule is disabled
    if (userRuleConfig === false) {
        return false;
    }
    // If user config is defined, use user config
    if (userRuleConfig !== true && userRuleConfig !== undefined) {
        return userRuleConfig;
    }
    // If user config is true, use preset config
    if (userRuleConfig === true) {
        return presetRulesConfig;
    }
    // In other cases, use preset config
    return presetRulesConfig;
};
export async function loadPreset({
    presetName,
    presetRulesOptions,
    moduleResolver
}: {
    presetName: string;
    presetRulesOptions: NonNullable<TextlintRcConfig["rules"]>;
    moduleResolver: TextLintModuleResolver;
}): Promise<TextlintConfigDescriptor["rules"]> {
    const presetPackageName = moduleResolver.resolvePresetPackageName(presetName);
    const mod = await dynamicImport(presetPackageName.filePath, {
        parentModule: "config-loader"
    });
    const preset = moduleInterop(mod.exports?.default);
    if (!isTextlintRulePresetCreator(preset)) {
        throw new Error(`preset should have rules and rulesConfig: ${presetName}`);
    }
    // we should use preset.rules → some preset use different name actual rule
    /*
      // "textlint-rule-preset-example/index.js"
      {
        "rules": {

          "a: ruleA,
        },
        "rulesConfig": {
          "a": true
        }
      }

      - type: "RuleInPreset"
      - ruleId: "preset-example/rule-a"
      - options: true
      - filePath: path to "textlint-rule-preset-example/index.js"
      - moduleName: "textlint-rule-preset-example"
      - ruleKey: "a",
      - inputModuleName: "preset-example"
     */
    return Object.keys(preset.rules).map((ruleKey) => {
        const normalizedKey = normalizeTextlintPresetSubRuleKey({ preset: presetName, rule: ruleKey });
        return {
            type: "RuleInPreset",
            ruleId: normalizedKey,
            rule: preset.rules[ruleKey],
            options: getRuleOptions({
                userRuleConfig: (presetRulesOptions[ruleKey] as Record<string, unknown> | boolean) ?? true,
                presetRulesConfig: (preset.rulesConfig[ruleKey] as Record<string, unknown> | boolean) ?? true
            }),
            filePath: presetPackageName.filePath,
            // preset package name
            moduleName: presetPackageName.moduleName,
            inputModuleName: presetPackageName.inputModuleName,
            // rule key in preset
            ruleKey
        };
    });
}
