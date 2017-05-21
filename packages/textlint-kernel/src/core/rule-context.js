// LICENSE : MIT
"use strict";
const assert = require("assert");
import RuleFixer from "../fixer/rule-fixer";
import RuleError from "./rule-error";
import SeverityLevel from "../shared/type/SeverityLevel";
import { getSeverity } from "../shared/rule-severity";
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
 * @param {Config} textLintConfig
 * @param {Object|boolean} ruleOptions
 * @param {string} [configBaseDir]
 * @constructor
 */
export default function RuleContext({ ruleId, sourceCode, report, textLintConfig, ruleOptions, configBaseDir }) {
    Object.defineProperty(this, "id", { value: ruleId });
    /**
     * Please use `getConfigBaseDir` insteadof it.
     * @see https://github.com/textlint/textlint/issues/294
     * @deprecated
     */
    Object.defineProperty(this, "config", { value: textLintConfig });
    const severity = getSeverity(ruleOptions);

    /**
     * report function that is called in a rule
     * @param {TxtNode} node
     * @param {RuleError|any} ruleError error is a RuleError instance or any data
     */
    this.report = function(node, ruleError) {
        assert(!(node instanceof RuleError), "should be `report(node, ruleError);`");
        if (ruleError instanceof RuleError) {
            report({ ruleId, node, severity, ruleError });
        } else {
            const level = ruleError.severity || SeverityLevel.error;
            report({ ruleId, node, severity: level, ruleError });
        }
    };
    /**
     * Node's type values
     * @type {TextLintNodeType}
     */
    this.Syntax = sourceCode.getSyntax();
    /**
     * get file path current processing.
     * @type {Function}
     */
    this.getFilePath = sourceCode.getFilePath.bind(sourceCode);
    /**
     * get source code text
     * @type {Function}
     */
    this.getSource = sourceCode.getSource.bind(sourceCode);

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
    this.getConfigBaseDir = () => {
        return configBaseDir;
    };
    /**
     * CustomError object
     * @type {RuleError}
     */
    this.RuleError = RuleError;
    /**
     * Rule fixer command object
     * @type {RuleFixer}
     */
    this.fixer = ruleFixer;
}
