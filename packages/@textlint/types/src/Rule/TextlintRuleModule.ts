/**
 * Rule reporter function
 */
import { AnyTxtNode, TxtNodeType } from "@textlint/ast-node-types";
import { TextlintRuleOptions } from "./TextlintRuleOptions";
import { TextlintRuleContext } from "./TextlintRuleContext";

export type TextlintRuleReporter = (
    context: Readonly<TextlintRuleContext>,
    options?: TextlintRuleOptions
) => { [P in TxtNodeType]?: (node: AnyTxtNode) => void | Promise<any> };
export type TextlintFixableRuleModule = { linter: TextlintRuleReporter; fixer: TextlintRuleReporter };
/**
 * module.export = reporter | { linter, fixer }
 */
export type TextlintRuleModule = TextlintRuleReporter | TextlintFixableRuleModule;
