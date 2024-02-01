"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _common = _interopRequireDefault(require("./common.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _default(context, options = {}) {
  const {
    Syntax,
    RuleError,
    report,
    getSource
  } = context;
  return {
    // async test
    async [Syntax.Code](node) {
      return null;
    },
    [Syntax.Str](node) {
      // "Str" node
      const text = getSource(node);
      // check prh
      const result = (0, _common.default)(text);
      if (result.diffs.length > 0) {
        result.diffs.forEach(diff => {
          const ruleError = new RuleError(`Found ${diff.expected}!`, {
            index: diff.index // padding of index
          });
          report(node, ruleError);
        });
      }
      // check inline
      if (/bugs/.test(text)) {
        const indexOfBugs = text.search(/bugs/);
        const ruleError = new RuleError("Found bugs.", {
          index: indexOfBugs // padding of index
        });
        report(node, ruleError);
      }
    }
  };
}
//# sourceMappingURL=index.js.map