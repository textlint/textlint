// LICENSE : MIT
"use strict";

import { TextlintBaseRuleContext } from "./TextlintBaseRuleContext";
import { TxtNode } from "@textlint/ast-node-types";
import { TextlintRuleError, TextlintRuleReportedObject } from "./TextlintRuleError";
import { TextlintRuleContextFixCommandGenerator } from "./TextlintRuleContextFixCommandGenerator";

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
    report: (node: TxtNode, ruleError: TextlintRuleReportedObject | TextlintRuleError, _shouldNotUsed?: any) => void;
}
