// Probably same with TextlintKernelOptions
// TODO: @textlint/config-loader should be independent from @textlint/kernel
import type { TextlintKernelFilterRule, TextlintKernelPlugin, TextlintKernelRule } from "@textlint/kernel";
import type { TextlintRuleModule, TextlintRuleOptions } from "@textlint/types";

export type TextlintConfigPlugin = TextlintKernelPlugin & {
    type: "Plugin";
    /**
     * Absolute file path to the rule module
     */
    filePath: string;
    /**
     * plugin module name
     */
    moduleName: string;
    /**
     * Inputted module name
     * This module name is resolved by config-loader
     * The resolved module name will be `moduleName`.
     */
    inputModuleName: string;
};
//  a rule module
export type TextlintConfigSingleRule = TextlintKernelRule & {
    type: "Rule";
    /**
     * Absolute file path to the rule module
     */
    filePath: string;
    /**
     * rule module name
     * @example "textlint-rule-example"
     */
    moduleName: string;
    /**
     * Inputted module name
     * This module name is resolved by config-loader
     * The resolved module name will be `moduleName`.
     */
    inputModuleName: string;
};
// a rule in preset module
export type TextlintConfigRuleInPreset = TextlintKernelRule & {
    type: "RuleInPreset";
    /**
     * Absolute file path to the rule module
     */
    filePath: string;
    /**
     * preset module name
     * @example "textlint-rule-preset-example"
     */
    moduleName: string;
    /**
     * rule key in preset
     * @example In "{moduleName}/{ruleKey}", the ruleKey is "ruleKey"
     */
    ruleKey: string;
    /**
     * Inputted module name
     * This module name is resolved by config-loader
     * The resolved module name will be `moduleName`.
     *
     * Difference with `ruleId` is that `ruleId` is rule identifier and includes `preset-name`.
     * For example, `ruleId` is `preset-name/rule-key`.
     * But, `inputModuleName` is `preset-name`.
     */
    inputModuleName: string;
};
export type TextlintConfigRule = TextlintConfigSingleRule | TextlintConfigRuleInPreset;
export type TextlintConfigFilterRule = TextlintKernelFilterRule & {
    /**
     * Absolute file path to the rule module
     */
    filePath: string;
    /**
     * filter rule module name
     * @example "textlint-filter-rule-example"
     */
    moduleName: string;
    /**
     * Inputted module name
     * This module name is resolved by config-loader
     * The resolved module name will be `moduleName`.
     */
    inputModuleName: string;
};
export type TextlintConfigRulePreset = {
    id: string;
    preset: {
        rules: {
            [index: string]: TextlintRuleModule;
        };
        rulesConfig: {
            [index: string]: TextlintRuleOptions | boolean;
        };
    };
    filePath: string;
    moduleName: string;
};
export type TextlintConfigDescriptor = {
    // plugins
    plugins: TextlintConfigPlugin[];
    // rules
    // preset's rules is included in this
    rules: TextlintConfigRule[];
    // filterRules
    filterRules: TextlintConfigFilterRule[];
};
