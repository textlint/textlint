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
 *
 * textlint calls it for every file with a new context.
 * When it has `createOnce`, textlint calls `createOnce` one time instead, and uses the returned listeners for every file.
 */
export type TextlintRuleReporter<T extends object = object> = ((
    context: Readonly<TextlintRuleContext>,
    options?: TextlintRuleOptions<T>
) => TextlintRuleReportHandler) & {
    createOnce?: TextlintRuleCreateOnce<T>;
};

/**
 * `createOnce` of a rule function.
 *
 * textlint calls it one time for a rule entry, and calls the returned listeners for every file.
 * The context is the same object for every file. `report`, `getSource`, `getFilePath`, and `getConfigBaseDir`
 * refer to the file being linted, so they can be called only in the listeners.
 * The listeners must be synchronous: returning a Promise is an error.
 * Reset the state of a file in the `Document` listener, which runs first for every file.
 */
export type TextlintRuleCreateOnce<T extends object = object> = (
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
