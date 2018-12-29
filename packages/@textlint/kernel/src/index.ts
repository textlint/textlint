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

// @deprecated It will removed in the future. Use @textlint/types instead of it
export {
    // textlint rule interface
    TextlintRuleReporter,
    TextlintRuleModule,
    TextlintRuleOptions,
    // textlint filter rule interface
    TextlintFilterRuleReporter,
    TextlintFilterRuleOptions,
    // textlint plugin interface
    TextlintPluginCreator,
    TextlintPluginOptions,
    TextlintPluginProcessor,
    TextlintPluginProcessorConstructor
} from "@textlint/types";
