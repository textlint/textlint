// Kernel
export { TextlintKernel } from "./textlint-kernel";
// Kernel Descriptor
export * from "./descriptor/index";
// Types
export {
    TextlintResult,
    TextlintFixResult,
    TextlintFixCommand,
    TextlintMessage,
    // Kernel rule/filter/plugin format
    TextlintKernelRule,
    TextlintKernelFilterRule,
    TextlintKernelPlugin
} from "./textlint-kernel-interface";

/**
 * @deprecated These types will removed in the future. Use @textlint/types instead of it
 * If you use these types in your rule, you should use @textlint/types for your rule.
 * Related changes: https://github.com/textlint/textlint/pull/562
 */
export {
    // textlint rule interface
    TextlintRuleReporter,
    TextlintRuleModule,
    TextlintRuleOptions,
    TextlintRuleSeverityLevel,
    // textlint filter rule interface
    TextlintFilterRuleReporter,
    TextlintFilterRuleOptions,
    // textlint plugin interface
    TextlintPluginCreator,
    TextlintPluginOptions,
    TextlintPluginProcessor,
    TextlintPluginProcessorConstructor
} from "@textlint/types";
