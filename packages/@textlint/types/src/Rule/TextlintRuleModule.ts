/**
 * Rule reporter function
 */
import { ASTNodeTypes, TypeofTxtNode } from "@textlint/ast-node-types";
import { TextlintRuleOptions } from "./TextlintRuleOptions";
import { TextlintRuleContext } from "./TextlintRuleContext";
/**
 * Rule Reporter Handler object define handler for each TxtNode type.
 *
 * Note: *Handler* naming is come from ES Proxy.
 * `new Proxy(target, handler)`
 *
 * Each comment is example value of Markdown
 */
export type TextlintRuleReportHandler = { [P in ASTNodeTypes]?: (node: TypeofTxtNode<P>) => void | Promise<any> } & {
    [index: string]: (node: any) => void | Promise<any>;
};

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
