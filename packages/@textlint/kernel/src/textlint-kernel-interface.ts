// rule config
import type {
    TextlintFilterRuleOptions,
    TextlintFilterRuleReporter,
    TextlintPluginCreator,
    TextlintPluginOptions,
    TextlintRuleModule,
    TextlintRuleOptions
} from "@textlint/types";

export interface TextlintKernelConstructorOptions {
    /**
     * Suppress messages of severity:warning and severity:info
     */
    quiet?: boolean;
}

export interface TextlintKernelPlugin {
    // plugin name as key
    // this key should be normalized
    pluginId: string;
    // plugin module
    // For example, `plugin: require("@textlint/textlint-plugin-markdown")`
    plugin: TextlintPluginCreator;
    // plugin options
    options?: TextlintPluginOptions | boolean;
}

export interface TextlintKernelRule {
    // rule name as key
    // this key should be normalized
    // For example, "textlint-rule-example" => "example"
    // In Preset rule, "rule-name" of "textlint-rule-preset-example" => "example/rule-name"
    ruleId: string;
    // rule module
    // For example, `rule: require("textlint-rule-example")`
    rule: TextlintRuleModule;
    // rule options
    // Often rule option is written in .textlintrc
    options?: TextlintRuleOptions | boolean;
}

export interface TextlintKernelFilterRule {
    // filter rule name as key
    // this key should be normalized
    ruleId: string;
    // filter rule module instance
    rule: TextlintFilterRuleReporter;
    // filter rule options
    // Often rule option is written in .textlintrc
    options?: TextlintFilterRuleOptions | boolean;
}

export interface TextlintKernelOptions {
    // file type
    // For example) .md
    ext: string;
    // file path
    filePath?: string;
    // plugins
    plugins?: TextlintKernelPlugin[];
    // rules
    rules?: TextlintKernelRule[];
    // filterRules
    filterRules?: TextlintKernelFilterRule[];
    // config base directory
    // It is a value of context.getConfigBaseDir.
    configBaseDir?: string;
}
