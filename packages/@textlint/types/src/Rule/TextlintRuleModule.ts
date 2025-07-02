/**
 * Rule reporter function
 */
import { ASTNodeTypes, TypeofTxtNode } from "@textlint/ast-node-types";
import { TextlintRuleOptions } from "./TextlintRuleOptions.js";
import { TextlintRuleContext } from "./TextlintRuleContext.js";

/**
 * Rule Reporter Handler object define handler for each TxtNode type.
 *
 * Note: *Handler* naming is come from ES Proxy.
 * `new Proxy(target, handler)`
 *
 * Each comment is example value of Markdown
 */
export type TextlintRuleReportHandler = { [P in ASTNodeTypes]?: (node: TypeofTxtNode<P>) => void | Promise<void> } & {
    // TODO: node should be AnyNodeType
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: string]: (node: any) => void | Promise<void>;
};

/**
 * Textlint rule reporter function
 */
export type TextlintRuleReporter<T extends object = object> = (
    context: Readonly<TextlintRuleContext>,
    options?: TextlintRuleOptions<T>
) => TextlintRuleReportHandler;
/**
 * If Textlint rule has fixer, it should both of { linter, fixer }.
 */
export type TextlintFixableRuleModule<T extends object = object> = {
    linter: TextlintRuleReporter<T>;
    fixer: TextlintRuleReporter<T>;
};
/**
 * module.export = reporter | { linter, fixer }
 */
export type TextlintRuleModule<T extends object = object> = TextlintRuleReporter<T> | TextlintFixableRuleModule<T>;
