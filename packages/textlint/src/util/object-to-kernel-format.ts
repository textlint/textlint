import {
    TextlintFilterRuleOptions,
    TextlintFilterRuleReporter,
    TextlintKernelFilterRule,
    TextlintKernelPlugin,
    TextlintKernelRule,
    TextlintPluginCreator,
    TextlintRuleModule,
    TextlintRuleOptions
} from "@textlint/kernel";

/**
 * Convert rulesObject to TextlintKernelRule
 * {
 *     "rule-name": rule
 * },
 * {
 *     "rule-name": ruleOption
 * }
 *
 * => TextlintKernelRule
 */
export const rulesObjectToKernelRule: (
    rules: { [p: string]: TextlintRuleModule },
    rulesOption: { [p: string]: TextlintRuleOptions }
) => TextlintKernelRule[] = (
    rules: { [index: string]: TextlintRuleModule },
    rulesOption: { [index: string]: TextlintRuleOptions }
): TextlintKernelRule[] => {
    return Object.keys(rules).map(ruleId => {
        return {
            ruleId,
            rule: rules[ruleId],
            options: rulesOption[ruleId]
        };
    });
};

export const filterRulesObjectToKernelRule = (
    rules: { [index: string]: TextlintFilterRuleReporter },
    rulesOption: { [index: string]: TextlintFilterRuleOptions }
): TextlintKernelFilterRule[] => {
    return Object.keys(rules).map(ruleId => {
        return {
            ruleId,
            rule: rules[ruleId],
            options: rulesOption[ruleId]
        };
    });
};

/**
 * Convert pluginsObject to TextlintKernelPlugin
 * {
 *     "plugin-name": plugin
 * },
 * {
 *     "plugin-name": pluginOption
 * }
 *
 * => TextlintKernelPlugin
 */
export const pluginsObjectToKernelRule = (
    plugins: { [index: string]: TextlintPluginCreator },
    pluginsOption: { [index: string]: TextlintKernelPlugin["options"] }
): TextlintKernelPlugin[] => {
    return Object.keys(plugins).map(pluginId => {
        return {
            pluginId,
            plugin: plugins[pluginId],
            options: pluginsOption[pluginId]
        };
    });
};
