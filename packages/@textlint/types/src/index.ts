/**
 * @fileoverview
 * Public function and interface should be included `Textlint` prefix or postfix.
 * It aim to avoid conflict naming on user land code.
 */

// SourceCode
export type {
    TextlintSourceCode,
    TextlintSourceCodeArgs,
    TextlintSourceCodeLocation,
    TextlintSourceCodePosition,
    TextlintSourceCodeRange,
} from "./Source/TextlintSourceCode.js";
// RuleContext
export type { TextlintRulePaddingLocator } from "./Rule/TextlintRulePaddingLocator.js";
export type { TextlintRuleContextFixCommand } from "./Rule/TextlintRuleContextFixCommand.js";
export type { TextlintRuleContextFixCommandGenerator } from "./Rule/TextlintRuleContextFixCommandGenerator.js";
export type {
    TextlintRuleError,
    TextlintRuleErrorConstructor,
    TextlintRuleErrorDetails,
    TextlintRuleErrorPaddingLocation,
    TextlintRuleErrorPaddingLocationRange,
    TextlintRuleErrorPaddingLocationLoc,
    TextlintRuleReportedObject,
} from "./Rule/TextlintRuleError.js";
export type { TextlintRuleSeverityLevel } from "./Rule/TextlintRuleSeverityLevel.js";
export type { TextlintRuleSeverityLevelKey } from "./Rule/TextlintRuleSeverityLevelKey.js";
// Rule
export type {
    TextlintRuleContext,
    TextlintRuleContextReportFunction,
    TextlintRuleContextReportFunctionArgs,
} from "./Rule/TextlintRuleContext.js";
export type { TextlintRuleOptions } from "./Rule/TextlintRuleOptions.js";
export type {
    TextlintRuleReporter,
    TextlintFixableRuleModule,
    TextlintRuleModule,
    TextlintRuleReportHandler,
} from "./Rule/TextlintRuleModule.js";
// Filter Rule
export type {
    TextlintFilterRuleContext,
    TextlintFilterRuleShouldIgnoreFunction,
    TextlintFilterRuleShouldIgnoreFunctionArgs,
} from "./Rule/TextlintFilterRuleContext.js";
export type {
    TextlintFilterRuleModule,
    TextlintFilterRuleOptions,
    TextlintFilterRuleReporter,
    TextlintFilterRuleReportHandler,
} from "./Rule/TextlintFilterRuleModule.js";
// Plugin
export type {
    TextlintPluginCreator,
    TextlintPluginOptions,
    TextlintPluginProcessor,
    TextlintPluginProcessorConstructor,
    TextlintPluginPreProcessResult,
    TextlintPluginPostProcessResult,
} from "./Plugin/TextlintPluginModule.js";
// Output message from textlint
// This types is come from output of textlint lint results
export type {
    TextlintResult,
    TextlintFixResult,
    TextlintMessage,
    TextlintMessageFixCommand,
} from "./Message/TextlintResult.js";
