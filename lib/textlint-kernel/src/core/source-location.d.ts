import SourceCode from "./source-code";
import RuleError, { RuleErrorPadding } from "./rule-error";
import { TextlintMessage, TxtNode } from "../textlint-kernel-interface";
/**
 * @typedef {Object} ReportMessage
 * @property {string} ruleId
 * @property {TxtNode} node
 * @property {number} severity
 * @property {RuleError} ruleError error is a RuleError instance or any data
 */
export interface ReportMessage {
    ruleId: string;
    node: any;
    severity: number;
    ruleError: RuleError;
}
export default class SourceLocation {
    private source;
    /**
     *
     * @param {SourceCode} source
     */
    constructor(source: SourceCode);
    /**
     * adjust node's location with error's padding location.
     * @param {ReportMessage} reportedMessage
     * @returns {{line: number, column: number, fix?: FixCommand}}
     */
    adjust(reportedMessage: any): any;
    _adjustLoc(node: any, padding: RuleErrorPadding, _paddingIndex?: number): {
        line: any;
        column: any;
    };
    /**
     * Adjust `fix` command range
     * if `fix.isAbsolute` is not absolute position, adjust the position from the `node`.
     * @param {TxtNode} node
     * @param {TextlintMessage} paddingMessage
     * @returns {FixCommand|Object}
     * @private
     */
    _adjustFix(node: TxtNode, paddingMessage: TextlintMessage): {} | {
        fix: {
            range: number[];
            text: string;
        };
    };
}
