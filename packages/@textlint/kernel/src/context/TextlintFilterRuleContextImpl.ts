import type {
    TextlintFilterRuleContext,
    TextlintFilterRuleShouldIgnoreFunction,
    TextlintRulePaddingLocator,
    TextlintRuleSeverityLevel,
    TextlintSourceCode
} from "@textlint/types";
import { ASTNodeTypes } from "@textlint/ast-node-types";
import { TextlintRuleErrorImpl } from "./TextlintRuleErrorImpl.js";
import { createPaddingLocator } from "./TextlintRulePaddingLocator.js";
import { invariant } from "../util/invariant.js";
import { createGetConfigBaseDir, createGetFilePath, createGetSource } from "./TextlintRuleContextImpl.js";

// See the comment in TextlintRuleContextImpl.ts: the functions of a context are returned from factories,
// so V8 does not allocate them in the old generation.
const createShouldIgnore = (
    ruleId: string,
    ignoreReport: TextlintFilterRuleShouldIgnoreFunction
): TextlintFilterRuleContext["shouldIgnore"] => {
    return (range: [startIndex: number, endIndex: number], optional = {}) => {
        invariant(
            Array.isArray(range) && typeof range[0] === "number" && typeof range[1] === "number",
            "shouldIgnore([number, number]); accept range."
        );
        ignoreReport({ ruleId, range, optional });
    };
};

// The value of `context.Syntax`. Same as `TextlintSourceCode#getSyntax()`.
const Syntax = ASTNodeTypes;

/**
 * Rule context object is passed to each rule as `context`
 * @param {string} ruleId
 * @param {TextlintSourceCode} sourceCode
 * @param {ReportCallback} report
 * @param {Object|boolean|undefined} ruleOptions
 * @param {string} [configBaseDir]
 * @constructor
 */
export interface TextlintFilterRuleContextArgs {
    ruleId: string;
    ignoreReport: TextlintFilterRuleShouldIgnoreFunction;
    sourceCode: TextlintSourceCode;
    configBaseDir?: string;
    severityLevel: TextlintRuleSeverityLevel;
}

export class TextlintFilterRuleContextImpl implements TextlintFilterRuleContext {
    private _ruleId: string;
    private _sourceCode: TextlintSourceCode;
    private _severityLevel: TextlintRuleSeverityLevel;
    public locator: TextlintRulePaddingLocator;

    constructor(args: TextlintFilterRuleContextArgs) {
        this._ruleId = args.ruleId;
        this._sourceCode = args.sourceCode;
        this.locator = createPaddingLocator();
        this._severityLevel = args.severityLevel;
        this.shouldIgnore = createShouldIgnore(args.ruleId, args.ignoreReport);
        this.getFilePath = createGetFilePath(args.sourceCode);
        this.getSource = createGetSource(args.sourceCode);
        this.getConfigBaseDir = createGetConfigBaseDir(args.configBaseDir);
        Object.freeze(this);
    }

    /**
     * Rule id
     * @returns {string}
     */
    get id() {
        return this._ruleId;
    }

    get severity() {
        return this._severityLevel;
    }

    /**
     * Node's type values
     * @type {TextLintNodeType}
     */
    get Syntax(): typeof ASTNodeTypes {
        // Rules read it for each node, so return it without calling `getSyntax()` of the source code
        return Syntax;
    }

    /**
     * CustomError object
     * @type {RuleError}
     */
    get RuleError() {
        return TextlintRuleErrorImpl;
    }

    shouldIgnore: TextlintFilterRuleContext["shouldIgnore"];

    /**
     * Not use
     * @returns {() => void}
     */
    get report() {
        return () => {
            throw new Error("Filter rule can not report");
        };
    }

    /**
     * get file path current processing.
     */
    getFilePath: TextlintFilterRuleContext["getFilePath"];

    /**
     * Gets the source code for the given node.
     * @param {TxtNode=} node The AST node to get the text for.
     * @param {int=} beforeCount The number of characters before the node to retrieve.
     * @param {int=} afterCount The number of characters after the node to retrieve.
     * @returns {string} The text representing the AST node.
     */
    getSource: TextlintFilterRuleContext["getSource"];

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
    getConfigBaseDir: TextlintFilterRuleContext["getConfigBaseDir"];
}
