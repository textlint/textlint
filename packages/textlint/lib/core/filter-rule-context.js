// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = FilterRuleContext;
var assert = require("assert");
/**
 * This callback is displayed as a global member.
 * @callback ReportCallback
 * @param {ReportIgnoreMessage} message
 */

/**
 * Rule context object is passed to each rule as `context`
 * @param {string} ruleId
 * @param {SourceCode} sourceCode
 * @param {function(ReportIgnoreMessage)} ignoreReport
 * @param {Config} textLintConfig
 * @constructor
 */
function FilterRuleContext(_ref) {
  var ruleId = _ref.ruleId,
      sourceCode = _ref.sourceCode,
      ignoreReport = _ref.ignoreReport,
      textLintConfig = _ref.textLintConfig;

  Object.defineProperty(this, "id", { value: ruleId });
  Object.defineProperty(this, "config", { value: textLintConfig });
  /**
   * Report range for filtering
   * @param {number[]} range the `range` is absolute position values
   * @param {{ ruleId: string }} [optional] ignoring option object
   * - `ruleId` match the TextLintMessage.ruleId and filter the message. (default: `ruleId` of the rule)
   *   if `ruleId` is "*", match any TextLintMessage.ruleId.
   */
  this.shouldIgnore = function (range) {
    var optional = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    assert(Array.isArray(range) && typeof range[0] === "number" && typeof range[1] === "number", "shouldIgnore([number, number]); accept range.");
    ignoreReport({ ruleId: ruleId, range: range, optional: optional });
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
}
//# sourceMappingURL=filter-rule-context.js.map