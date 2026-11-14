// Kernel
export { TextlintKernel } from "./textlint-kernel.js";
// Kernel Descriptor
export {
    TextlintKernelDescriptor,
    TextlintRuleDescriptors,
    TextlintLintableRuleDescriptor,
    TextlintFixableRuleDescriptor,
    TextlintFilterRuleDescriptors,
    TextlintFilterRuleDescriptor,
    TextlintPluginDescriptors,
    TextlintPluginDescriptor
} from "./descriptor/index.js";
// Kernel rule/filter/plugin format
export {
    TextlintKernelRule,
    TextlintKernelFilterRule,
    TextlintKernelPlugin,
    TextlintKernelOptions
} from "./textlint-kernel-interface.js";

/**
 * Types of textlint lint/fix result
 */
export type { TextlintResult, TextlintFixResult, TextlintMessageFixCommand, TextlintMessage } from "@textlint/types";
// TextlintRuleSeverityLevel Key
export { TextlintRuleSeverityLevelKeys } from "./context/TextlintRuleSeverityLevelKeys.js";
