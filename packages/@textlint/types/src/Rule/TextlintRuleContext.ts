// LICENSE : MIT

import type { TextlintBaseRuleContext } from "./TextlintBaseRuleContext.js";
import type { TxtNode } from "@textlint/ast-node-types";
import type { TextlintRuleError, TextlintRuleReportedObject } from "./TextlintRuleError.js";
import type { TextlintRuleContextFixCommandGenerator } from "./TextlintRuleContextFixCommandGenerator.js";

/**
 * context.report function
 */
export interface TextlintRuleContextReportFunctionArgs {
    ruleId: string;
    node: TxtNode;
    severity: number;
    ruleError: TextlintRuleError | TextlintRuleReportedObject;
}

/**
 * Rule's context.report() function
 */
export type TextlintRuleContextReportFunction = (args: TextlintRuleContextReportFunctionArgs) => void;

export interface TextlintRuleContext extends TextlintBaseRuleContext {
    fixer: TextlintRuleContextFixCommandGenerator;
    report: (node: TxtNode, ruleError: TextlintRuleReportedObject | TextlintRuleError, _shouldNotUsed?: never) => void;
}
