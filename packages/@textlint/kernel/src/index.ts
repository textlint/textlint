// Kernel
export { TextlintKernel } from "./textlint-kernel";
// Types
export {
    TextlintResult,
    TextlintFixResult,
    TextlintFixCommand,
    TextlintMessage,
    // Kernel rule/filter/plugin format
    TextlintKernelRule,
    TextlintKernelFilterRule,
    TextlintKernelPlugin,
    // Notes: Following interface will be separated module in the future.
    // textlint rule interface
    TextlintRuleCreateReporter,
    TextlintRuleCreator,
    TextlintRuleOptions,
    // textlint filter rule interface
    TextlintFilterRuleCreator,
    TextlintFilterRuleOptions,
    // textlint plugin interface
    TextlintPluginCreator,
    TextlintPluginOptions,
    TextlintPluginProcessor,
    TextlintPluginProcessorConstructor
} from "./textlint-kernel-interface";
