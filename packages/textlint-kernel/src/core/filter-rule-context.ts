// LICENSE : MIT
"use strict";
import SourceCode from "./source-code";
import { TextLintConfig, TxtNode } from "../textlint-kernel-interface";
import RuleError from "./rule-error";
import { ShouldIgnoreFunction } from "../task/textlint-core-task";

const assert = require("assert");

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
 * @param {Config} textLintConfig
 * @param {Object|boolean} ruleOptions
 * @param {string} [configBaseDir]
 * @constructor
 */
export interface FilterRuleContextArgs {
    ruleId: string;
    ignoreReport: ShouldIgnoreFunction;
    sourceCode: SourceCode;
    textLintConfig: TextLintConfig
    // FIXME: support this
    configBaseDir?: string;
}

/**
 * Rule context object is passed to each rule as `context`
 * @param {string} ruleId
 * @param {SourceCode} sourceCode
 * @param {function(ShouldIgnoreArgs)} ignoreReport
 * @param {Config} textLintConfig
 * @constructor
 */
export default class FilterRuleContext {
    private _ruleId: string;
    private _ignoreReport: ShouldIgnoreFunction;
    private _sourceCode: SourceCode;
    private _textLintConfig: TextLintConfig;
    private _configBaseDir?: string;

    constructor(args: FilterRuleContextArgs) {
        this._ruleId = args.ruleId;
        this._sourceCode = args.sourceCode;
        this._ignoreReport = args.ignoreReport;
        this._textLintConfig = args.textLintConfig;
        this._configBaseDir = args.configBaseDir;
    }

    /**
     * Rule id
     * @returns {string}
     */
    get id() {
        return this._ruleId;
    }

    /**
     * Please use `getConfigBaseDir` insteadof it.
     * @see https://github.com/textlint/textlint/issues/294
     * @deprecated
     */
    get config() {
        return this._textLintConfig;
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
    };

    shouldIgnore = (range: [number, number], optional = {}) => {
        assert(Array.isArray(range) && typeof range[0] === "number" && typeof range[1] === "number",
            "shouldIgnore([number, number]); accept range.");
        this._ignoreReport({ ruleId: this._ruleId, range, optional });
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
