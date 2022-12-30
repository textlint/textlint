import { TextLintModuleResolver } from "./textlint-module-resolver";
import { isPresetRuleKey } from "./config-util";
import { TextlintRcConfig } from "./TextlintRcConfig";
import { moduleInterop } from "@textlint/module-interop";
import { TextlintConfigDescriptor } from "./TextlintConfigDescriptor";
import { loadPreset } from "./preset-loader";
import { TextlintPluginCreator } from "@textlint/types";
import { isTextlintFilterRuleReporter, isTextlintRuleModule } from "./is";
import { dynamicImport } from "./import";

const isPluginCreator = (mod: any): mod is TextlintPluginCreator => {
    return typeof mod === "object" && Object.prototype.hasOwnProperty.call(mod, "Processor");
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
                const mod = await dynamicImport(resolvedModule.filePath);
                const plugin = moduleInterop(mod.default);
                if (!isPluginCreator(plugin)) {
                    pluginErrors.push(
                        new Error(`Plugin should be object that has "Processor" property. But "${pluginId}" is not.

Please check "${pluginId}" is valid plugin.
FilePath: ${resolvedModule.filePath}

For more details, See FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md
`)
                    );
                }
                plugins.push({
                    pluginId,
                    plugin,
                    filePath: resolvedModule.filePath,
                    moduleName: resolvedModule.moduleName
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
                        const mod = await dynamicImport(resolvedPlugin.filePath);
                        const plugin = moduleInterop(mod.default);
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
                            pluginId,
                            plugin,
                            options: pluginOptions,
                            filePath: resolvedPlugin.filePath,
                            moduleName: resolvedPlugin.moduleName
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
                    const mod = await dynamicImport(resolvePackage.filePath);
                    const ruleModule = moduleInterop(mod.default);
                    if (!isTextlintFilterRuleReporter(ruleModule)) {
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
                        moduleName: resolvePackage.moduleName
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
                        const presetRulesOptions = typeof ruleOptions === "boolean" ? {} : ruleOptions;
                        const rulesInPreset = await loadPreset({
                            presetName: ruleId,
                            presetRulesOptions,
                            moduleResolver
                        });
                        rules.push(...rulesInPreset);
                    } else {
                        // load rule
                        const resolvePackage = moduleResolver.resolveRulePackageName(ruleId);
                        const mod = await dynamicImport(resolvePackage.filePath);
                        const ruleModule = moduleInterop(mod.default);
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
                            ruleId,
                            rule: ruleModule,
                            options: ruleOptions,
                            filePath: resolvePackage.filePath,
                            moduleName: resolvePackage.moduleName
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
