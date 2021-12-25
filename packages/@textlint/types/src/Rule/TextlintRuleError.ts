// LICENSE : MIT
"use strict";
import { TextlintRuleContextFixCommand } from "./TextlintRuleContextFixCommand";

export type TextlintRuleErrorLocation = {
    range: [startIndex: number, endIndex: number];
    isAbsolute: false; // TODO: currently always relative from node position
};

/**
 * Object version of RuleError
 * It is undocumented way. Please don't use it.
 *
 * report(node, {
 *   message: ""
 * })
 */
export interface TextlintRuleReportedObject {
    /**
     * @deprecated use `loc` property
     */
    line?: number;
    /**
     * @deprecated use `loc` property
     */
    column?: number;
    /**
     * @deprecated use `loc` property
     */
    index?: number;
    loc?: TextlintRuleErrorLocation;
    fix?: TextlintRuleContextFixCommand;
    message: string;
    severity?: number;

    [index: string]: any;
}

export interface TextlintRuleErrorPadding {
    /**
     * @deprecated use `loc` property
     */
    line?: number;
    /**
     * @deprecated use `loc` property
     */
    column?: number;
    /**
     * @deprecated use `loc` property
     */
    index?: number;
    loc?: TextlintRuleErrorLocation;
    fix?: TextlintRuleContextFixCommand;
}

export interface TextlintRuleErrorConstructor {
    new (message: string, paddingLocation?: number | TextlintRuleErrorPadding): TextlintRuleError;
}

export interface TextlintRuleError {
    readonly message: string;
    /**
     * @deprecated use `loc` property
     */
    readonly line?: number;
    /**
     * @deprecated use `loc` property
     */
    readonly column?: number;
    /**
     * @deprecated use `loc` property
     */
    readonly index?: number;
    readonly loc?: TextlintRuleErrorLocation;
    readonly fix?: TextlintRuleContextFixCommand;
}
