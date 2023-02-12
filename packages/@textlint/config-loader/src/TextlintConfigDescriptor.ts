// Probably same with TextlintKernelOptions
// TODO: @textlint/config-loader should be independent from @textlint/kernel
import type { TextlintKernelFilterRule, TextlintKernelPlugin, TextlintKernelRule } from "@textlint/kernel";
import type { TextlintRuleModule, TextlintRuleOptions } from "@textlint/types";

export type TextlintConfigPlugin = TextlintKernelPlugin & { filePath: string; moduleName: string };
//  a rule module
export type TextlintConfigSingleRule = TextlintKernelRule & { type: "Rule"; filePath: string; moduleName: string };
// a rule in preset module
export type TextlintConfigRuleInPreset = TextlintKernelRule & {
    type: "RuleInPreset";
    filePath: string;
    moduleName: string;
    ruleKey: string;
};
export type TextlintConfigRule = TextlintConfigSingleRule | TextlintConfigRuleInPreset;
export type TextlintConfigFilterRule = TextlintKernelFilterRule & { filePath: string; moduleName: string };
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
