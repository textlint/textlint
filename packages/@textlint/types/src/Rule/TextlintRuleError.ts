// LICENSE : MIT
"use strict";
import { TextlintRuleContextFixCommand } from "./TextlintRuleContextFixCommand";

/**
 * Object version of RuleError
 * It is undocument way. Please dont use it.
 *
 * report(node, {
 *   message: ""
 * })
 */
export interface TextlintRuleReportedObject {
    line?: number;
    column?: number;
    index?: number;
    fix?: TextlintRuleContextFixCommand;
    message: string;
    severity?: number;

    [index: string]: any;
}

export interface TextlintRuleErrorPadding {
    line?: number;
    column?: number;
    index?: number;
    fix?: TextlintRuleContextFixCommand;
}

export interface TextlintRuleErrorContructor {
    new (message: string, paddingLocation?: number | TextlintRuleErrorPadding): TextlintRuleError;
}

export abstract class TextlintRuleError {
    abstract readonly message: string;
    abstract readonly line?: number;
    abstract readonly column?: number;
    abstract readonly index?: number;
    abstract readonly fix?: TextlintRuleContextFixCommand;
}
