// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = RuleContext;

var _ruleFixer;

function _load_ruleFixer() {
  return _ruleFixer = _interopRequireDefault(require("../fixer/rule-fixer"));
}

var _ruleError;

function _load_ruleError() {
  return _ruleError = _interopRequireDefault(require("./rule-error"));
}

var _SeverityLevel;

function _load_SeverityLevel() {
  return _SeverityLevel = _interopRequireDefault(require("../shared/type/SeverityLevel"));
}

var _ruleSeverity;

function _load_ruleSeverity() {
  return _ruleSeverity = require("../shared/rule-severity");
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var assert = require("assert");

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
 * @param {Object|boolean} ruleConfig
 * @constructor
 */
function RuleContext(_ref) {
  var ruleId = _ref.ruleId,
      sourceCode = _ref.sourceCode,
      report = _ref.report,
      textLintConfig = _ref.textLintConfig,
      ruleConfig = _ref.ruleConfig;

  Object.defineProperty(this, "id", { value: ruleId });
  Object.defineProperty(this, "config", { value: textLintConfig });
  var severity = (0, (_ruleSeverity || _load_ruleSeverity()).getSeverity)(ruleConfig);

  /**
   * report function that is called in a rule
   * @param {TxtNode} node
   * @param {RuleError|any} ruleError error is a RuleError instance or any data
   */
  this.report = function (node, ruleError) {
    assert(!(node instanceof (_ruleError || _load_ruleError()).default), "should be `report(node, ruleError);`");
    if (ruleError instanceof (_ruleError || _load_ruleError()).default) {
      report({ ruleId: ruleId, node: node, severity: severity, ruleError: ruleError });
    } else {
      var level = ruleError.severity || (_SeverityLevel || _load_SeverityLevel()).default.error;
      report({ ruleId: ruleId, node: node, severity: level, ruleError: ruleError });
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
   * CustomError object
   * @type {RuleError}
   */
  this.RuleError = (_ruleError || _load_ruleError()).default;
  /**
   * Rule fixer command object
   * @type {RuleFixer}
   */
  this.fixer = new (_ruleFixer || _load_ruleFixer()).default();
}
//# sourceMappingURL=rule-context.js.map