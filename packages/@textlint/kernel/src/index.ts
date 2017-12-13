// Kernel
export { TextlintKernel } from "./textlint-kernel";
// Types
export {
    TextlintResult,
    TextlintFixResult,
    TextlintFixCommand,
    TextlintMessage,
    // Kernel rule/filter/plugin
    TextlintKernelRule,
    TextlintKernelFilterRule,
    TextlintKernelPlugin,
    // TODO: textlint rule interface
    // TODO: textlint filter rule interface
    // textlint plugin interface
    TextlintPluginCreator,
    TextlintPluginProcessor,
    TextlintPluginProcessorConstructor
} from "./textlint-kernel-interface";
