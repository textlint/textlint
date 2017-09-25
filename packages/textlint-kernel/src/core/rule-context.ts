// LICENSE : MIT
"use strict";
const assert = require("assert");
import RuleFixer from "../fixer/rule-fixer";
import RuleError from "./rule-error";
import SeverityLevel from "../shared/type/SeverityLevel";
import { getSeverity } from "../shared/rule-severity";
import SourceCode from "./source-code";
import { TextLintRuleOptions, TxtNode } from "../textlint-kernel-interface";
import { ReportFunction } from "../task/textlint-core-task";
// instance for rule context
const ruleFixer = new RuleFixer();

/**
 * This callback is displayed as a global member.
 * @callback ReportCallback
 * @param {ReportMessage} message
 */
/**
 * Rule context object is passed to each rule as `context`
 * @param {string} ruleId
 * @param {SourceCode} sourceCode
 * @param {ReportCallback} report
 * @param {Object|boolean|undefined} ruleOptions
 * @param {string} [configBaseDir]
 * @constructor
 */
export interface RuleContextArgs {
    ruleId: string;
    sourceCode: SourceCode;
    report: ReportFunction;
    ruleOptions?: TextLintRuleOptions | boolean;
    configBaseDir?: string;
}

export interface RuleReportedObject {
    [index: string]: any;

    message: string;
    severity?: number;
}

export default class RuleContext {
    private _ruleId: string;
    private _sourceCode: SourceCode;
    private _report: ReportFunction;
    private _ruleOptions?: TextLintRuleOptions | boolean;
    private _configBaseDir?: string;
    private _severity: number;

    constructor(args: RuleContextArgs) {
        this._ruleId = args.ruleId;
        this._sourceCode = args.sourceCode;
        this._report = args.report;
        this._ruleOptions = args.ruleOptions;
        this._configBaseDir = args.configBaseDir;
        this._severity = getSeverity(this._ruleOptions);
    }

    /**
     * Rule id
     * @returns {string}
     */
    get id() {
        return this._ruleId;
    }

    get severity() {
        return this._severity;
    }

    /**
     * Node's type values
     * @type {TextLintNodeType}
     */
    get Syntax() {
        return this._sourceCode.getSyntax();
    }

    /**
     * CustomError object
     * @type {RuleError}
     */
    get RuleError() {
        return RuleError;
    }

    /**
     * Rule fixer command object
     * @type {RuleFixer}
     */
    get fixer() {
        return ruleFixer;
    }

    /**
     * report function that is called in a rule
     * @param {TxtNode} node
     * @param {RuleError|any} ruleError error is a RuleError instance or any data
     */
    report = (node: TxtNode, ruleError: RuleError | RuleReportedObject) => {
        assert(!(node instanceof RuleError), "should be `report(node, ruleError);`");
        if (ruleError instanceof RuleError) {
            // FIXME: severity is internal API
            this._report({ ruleId: this._ruleId, node, severity: this._severity, ruleError });
        } else {
            const level = ruleError.severity || SeverityLevel.error;
            this._report({ ruleId: this._ruleId, node, severity: level, ruleError });
        }
    };

    /**
     * get file path current processing.
     */
    getFilePath = () => {
        return this._sourceCode.getFilePath();
    };

    /**
     * Gets the source code for the given node.
     * @param {TxtNode=} node The AST node to get the text for.
     * @param {int=} beforeCount The number of characters before the node to retrieve.
     * @param {int=} afterCount The number of characters after the node to retrieve.
     * @returns {string|null} The text representing the AST node.
     */
    getSource = (node: TxtNode, beforeCount?: number, afterCount?: number) => {
        return this._sourceCode.getSource(node, beforeCount, afterCount);
    };

    /**
     * get config base directory path
     * config base directory path often is the place of .textlintrc
     *
     * e.g.) /path/to/dir/.textlintrc
     * `getConfigBaseDir()` return `"/path/to/dir/"`.
     *
     * When using textlint as module, it is specified by `configBaseDir`
     * If not found the value, return undefined.
     *
     * You can use it for resolving relative path from config dir.
     * @returns {string|undefined}
     */
    getConfigBaseDir = () => {
        return this._configBaseDir;
    };
}
