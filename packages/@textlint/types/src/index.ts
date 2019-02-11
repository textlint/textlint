/**
 * @fileoverview
 * Public function and interface should be included `Textlint` prefix or postfix.
 * It aim to avoid conflict naming on user land code.
 */

// SourceCode
export {
    TextlintSourceCode,
    TextlintSourceCodeArgs,
    TextlintSourceCodeLocation,
    TextlintSourceCodePosition,
    TextlintSourceCodeRange
} from "./Source/TextlintSourceCode";
// RuleContext
export { TextlintRuleContextFixCommand } from "./Rule/TextlintRuleContextFixCommand";
export { TextlintRuleContextFixCommandGenerator } from "./Rule/TextlintRuleContextFixCommandGenerator";
export { TextlintRuleError, TextlintRuleErrorPadding, TextlintRuleReportedObject } from "./Rule/TextlintRuleError";
export { TextlintRuleSeverityLevel } from "./Rule/TextlintRuleSeverityLevel";
// Rule
export {
    TextlintRuleContext,
    TextlintRuleContextArgs,
    TextlintRuleContextReportFunction,
    TextlintRuleContextReportFunctionArgs
} from "./Rule/TextlintRuleContext";
export { TextlintRuleOptions } from "./Rule/TextlintRuleOptions";
export {
    TextlintRuleReporter,
    TextlintFixableRuleModule,
    TextlintRuleModule,
    TextlintRuleReportHandler
} from "./Rule/TextlintRuleModule";
// Filter Rule
export {
    TextlintFilterRuleContext,
    TextlintFilterRuleShouldIgnoreFunction,
    TextlintFilterRuleShouldIgnoreFunctionArgs
} from "./Rule/TextlintFilterRuleContext";
export {
    TextlintFilterRuleModule,
    TextlintFilterRuleOptions,
    TextlintFilterRuleReporter,
    TextlintFilterRuleReportHandler
} from "./Rule/TextlintFilterRuleModule";
// Plugin
export {
    TextlintPluginCreator,
    TextlintPluginOptions,
    TextlintPluginProcessor,
    TextlintPluginProcessorConstructor
} from "./Plugin/TextlintPluginModule";
// Output message from textlint
// This types is come from output of textlint lint results
export {
    TextlintResult,
    TextlintFixResult,
    TextlintMessage,
    TextlintMessageFixCommand
} from "./Message/TextlintResult";
// Key Path
export {
    normalizeTextlintPresetSubRuleKey,
    normalizeTextlintRuleKey,
    normalizeTextlintRulePresetKey,
    normalizeTextlintPluginKey,
    normalizeTextlintFilterRuleKey,
    normalizeTextlintKeyPath
} from "./KeyPath/TextlintKeyPath";
export { TextlintPackageNamePrefix } from "./KeyPath/TextlintPackagePrefix";
