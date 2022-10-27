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
} from "./Source/TextlintSourceCode";
// RuleContext
export type { TextlintRulePaddingLocator } from "./Rule/TextlintRulePaddingLocator";
export type { TextlintRuleContextFixCommand } from "./Rule/TextlintRuleContextFixCommand";
export type { TextlintRuleContextFixCommandGenerator } from "./Rule/TextlintRuleContextFixCommandGenerator";
export type {
    TextlintRuleError,
    TextlintRuleErrorConstructor,
    TextlintRuleErrorDetails,
    TextlintRuleErrorPaddingLocation,
    TextlintRuleErrorPaddingLocationRange,
    TextlintRuleErrorPaddingLocationLoc,
    TextlintRuleReportedObject,
} from "./Rule/TextlintRuleError";
export type { TextlintRuleSeverityLevel } from "./Rule/TextlintRuleSeverityLevel";
// Rule
export type {
    TextlintRuleContext,
    TextlintRuleContextReportFunction,
    TextlintRuleContextReportFunctionArgs,
} from "./Rule/TextlintRuleContext";
export type { TextlintRuleOptions } from "./Rule/TextlintRuleOptions";
export type {
    TextlintRuleReporter,
    TextlintFixableRuleModule,
    TextlintRuleModule,
    TextlintRuleReportHandler,
} from "./Rule/TextlintRuleModule";
// Filter Rule
export type {
    TextlintFilterRuleContext,
    TextlintFilterRuleShouldIgnoreFunction,
    TextlintFilterRuleShouldIgnoreFunctionArgs,
} from "./Rule/TextlintFilterRuleContext";
export type {
    TextlintFilterRuleModule,
    TextlintFilterRuleOptions,
    TextlintFilterRuleReporter,
    TextlintFilterRuleReportHandler,
} from "./Rule/TextlintFilterRuleModule";
// Plugin
export type {
    TextlintPluginCreator,
    TextlintPluginOptions,
    TextlintPluginProcessor,
    TextlintPluginProcessorConstructor,
    TextlintPluginPreProcessResult,
    TextlintPluginPostProcessResult,
} from "./Plugin/TextlintPluginModule";
// Output message from textlint
// This types is come from output of textlint lint results
export type {
    TextlintResult,
    TextlintFixResult,
    TextlintMessage,
    TextlintMessageFixCommand,
} from "./Message/TextlintResult";
