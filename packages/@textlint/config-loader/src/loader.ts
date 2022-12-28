import { TextLintModuleResolver } from "./textlint-module-resolver";
import { isPresetRuleKey } from "./config-util";
import { TextlintRcConfig } from "./TextlintRcConfig";
import { moduleInterop } from "@textlint/module-interop";
import { TextlintConfigDescriptor } from "./TextlintConfigDescriptor";
import { loadPreset } from "./preset-loader";

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
        pluginsObject.forEach((pluginId) => {
            const resolvedModule = moduleResolver.resolvePluginPackageName(pluginId);
            const plugin = moduleInterop(require(resolvedModule.filePath));
            plugins.push({
                pluginId,
                plugin,
                filePath: resolvedModule.filePath,
                moduleName: resolvedModule.moduleName
            });
        });
    } else {
        // { plugins: { "a": true, "b": options } }
        Object.entries(pluginsObject).forEach(([pluginId, pluginOptions]) => {
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
                    const pluginModule = moduleInterop(require(resolvedPlugin.filePath));
                    plugins.push({
                        pluginId,
                        plugin: pluginModule,
                        options: pluginOptions,
                        filePath: resolvedPlugin.filePath,
                        moduleName: resolvedPlugin.moduleName
                    });
                }
            } catch (error) {
                pluginErrors.push(error as Error);
            }
        });
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
    Object.entries(rulesObject).forEach(([ruleId, ruleOptions]) => {
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
                const ruleModule = moduleInterop(require(resolvePackage.filePath));
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
    });
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
    Object.entries(rulesObject).forEach(([ruleId, ruleOptions]) => {
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
                    // const resolvePackage = moduleResolver.resolvePresetPackageName(ruleId);
                    // const ruleModule = moduleInterop(require(resolvePackage.filePath));
                    const presetRulesOptions = typeof ruleOptions === "boolean" ? {} : ruleOptions;
                    const rulesInPreset = loadPreset({
                        presetName: ruleId,
                        presetRulesOptions,
                        moduleResolver
                    });
                    rules.push(...rulesInPreset);
                } else {
                    // load rule
                    const resolvePackage = moduleResolver.resolveRulePackageName(ruleId);
                    const ruleModule = moduleInterop(require(resolvePackage.filePath));
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
    });
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
