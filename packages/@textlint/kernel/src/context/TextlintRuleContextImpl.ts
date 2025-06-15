import {
    TextlintRuleContext,
    TextlintRuleContextReportFunction,
    TextlintRuleError,
    TextlintRulePaddingLocator,
    TextlintRuleReportedObject,
    TextlintRuleSeverityLevel,
    TextlintSourceCode
} from "@textlint/types";
import { ASTNodeTypes, TxtNode } from "@textlint/ast-node-types";
import { TextlintRuleContextFixCommandGeneratorImpl } from "./TextlintRuleContextFixCommandGeneratorImpl.js";
import { TextlintRuleSeverityLevelKeys } from "./TextlintRuleSeverityLevelKeys.js";
import { TextlintRuleErrorImpl } from "./TextlintRuleErrorImpl.js";
import { createPaddingLocator } from "./TextlintRulePaddingLocator.js";
import { invariant } from "../util/invariant.js";

const ruleFixer = new TextlintRuleContextFixCommandGeneratorImpl();

/**
 * Rule context object is passed to each rule as `context`
 * @param {string} ruleId
 * @param {TextlintSourceCode} sourceCode
 * @param {ReportCallback} report
 * @param {Object|boolean|undefined} ruleOptions
 * @param {string} [configBaseDir]
 * @constructor
 */
export interface TextlintRuleContextArgs {
    ruleId: string;
    sourceCode: TextlintSourceCode;
    report: TextlintRuleContextReportFunction;
    configBaseDir?: string;
    severityLevel: TextlintRuleSeverityLevel;
}

export class TextlintRuleContextImpl implements TextlintRuleContext {
    private _ruleId: string;
    private _sourceCode: TextlintSourceCode;
    private _report: TextlintRuleContextReportFunction;
    private _configBaseDir?: string;
    private _severityLevel: TextlintRuleSeverityLevel;
    public locator: TextlintRulePaddingLocator;

    constructor(args: TextlintRuleContextArgs) {
        this._ruleId = args.ruleId;
        this._sourceCode = args.sourceCode;
        this._report = args.report;
        this.locator = createPaddingLocator();
        this._configBaseDir = args.configBaseDir;
        this._severityLevel = args.severityLevel;
        Object.freeze(this);
    }

    /**
     * Rule id
     * @returns {string}
     */
    get id() {
        return this._ruleId;
    }

    /**
     * severity level
     */
    get severity(): TextlintRuleSeverityLevel {
        return this._severityLevel;
    }

    /**
     * Node's type values
     * @type {ASTNodeTypes}
     */
    get Syntax(): typeof ASTNodeTypes {
        return this._sourceCode.getSyntax();
    }

    /**
     * CustomError object
     * @type {RuleError}
     */
    get RuleError() {
        return TextlintRuleErrorImpl;
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
     */
    report = (node: TxtNode, ruleError: TextlintRuleError | TextlintRuleReportedObject, _shouldNotUsed?: never) => {
        invariant(
            !(node instanceof TextlintRuleErrorImpl),
            "1st argument should be node. Usage: `report(node, ruleError);`"
        );
        invariant(_shouldNotUsed === undefined, "3rd argument should not be used. Usage: `report(node, ruleError);`");
        if (ruleError instanceof TextlintRuleErrorImpl) {
            // severity come from `.textlintrc` option like `{ "<rule-name>" : { serverity: "warning" } } `
            this._report({ ruleId: this._ruleId, node, severity: this._severityLevel, ruleError });
        } else {
            const ruleReportedObject: TextlintRuleReportedObject = ruleError;
            // severity come from report arguments like `report(node, { severity: 1 })`
            const level = ruleReportedObject.severity || TextlintRuleSeverityLevelKeys.error;
            this._report({ ruleId: this._ruleId, node, severity: level, ruleError: ruleReportedObject });
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
     * @returns {string} The text representing the AST node.
     */
    getSource = (node?: TxtNode, beforeCount?: number, afterCount?: number): string => {
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
