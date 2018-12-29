/**
 * Rule reporter function
 */
import { AnyTxtNode, TxtNodeType } from "@textlint/ast-node-types";
import { TextlintRuleOptions } from "./TextlintRuleOptions";
import { TextlintRuleContext } from "./TextlintRuleContext";

/**
 * Rule Reporter Handler object define handler for each TxtNode type.
 *
 * Note: *Handler* naming is come from ES Proxy.
 * `new Proxy(target, handler)`
 */
export type TextlintRuleReportHandler = { [P in TxtNodeType]?: (node: AnyTxtNode) => void | Promise<any> };
/**
 * Textlint rule reporter function
 */
export type TextlintRuleReporter = (
    context: Readonly<TextlintRuleContext>,
    options?: TextlintRuleOptions
) => TextlintRuleReportHandler;
/**
 * If Textlint rule has fixer, it should both of { linter, fixer }.
 */
export type TextlintFixableRuleModule = { linter: TextlintRuleReporter; fixer: TextlintRuleReporter };
/**
 * module.export = reporter | { linter, fixer }
 */
export type TextlintRuleModule = TextlintRuleReporter | TextlintFixableRuleModule;
