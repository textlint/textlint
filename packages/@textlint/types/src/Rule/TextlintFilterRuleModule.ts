/**
 * Filter rule reporter function
 */
import { TextlintFilterRuleContext } from "./TextlintFilterRuleContext.js";
import { ASTNodeTypes, TypeofTxtNode } from "@textlint/ast-node-types";
/**
 * textlint filter rule option values is object or boolean.
 * if this option value is false, disable the filter rule.
 */
export type TextlintFilterRuleOptions = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: string]: any;
};

/**
 * Rule Reporter Handler object define handler for each TxtNode type.
 */
export type TextlintFilterRuleReportHandler = {
    [P in ASTNodeTypes]?: (node: TypeofTxtNode<P>) => void | Promise<void>;
} & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: string]: (node: any) => void | Promise<void>;
};

/**
 * textlint filter rule report function
 */
export type TextlintFilterRuleReporter = (
    context: Readonly<TextlintFilterRuleContext>,
    options?: TextlintFilterRuleOptions
) => TextlintFilterRuleReportHandler;
/**
 * textlint filter module exports
 * Currently, module.exports = reporter;
 */
export type TextlintFilterRuleModule = TextlintFilterRuleReporter;
