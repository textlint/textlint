"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = void 0;
var _common = _interopRequireDefault(require("./common"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _asyncToGenerator(fn) {
    return function () {
        var self = this,
            args = arguments;
        return new Promise(function (resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
var report = function report(context) {
    var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var { Syntax, RuleError, report, getSource } = context;
    return {
        // async test
        [Syntax.Code]() {
            return _asyncToGenerator(function* () {
                return null;
            })();
        },
        [Syntax.Str](node) {
            // "Str" node
            var text = getSource(node);
            // check prh
            var result = (0, _common.default)(text);
            if (result.diffs.length > 0) {
                result.diffs.forEach((diff) => {
                    var ruleError = new RuleError("Found " + diff.expected + "!", {
                        index: diff.index // padding of index
                    });
                    report(node, ruleError);
                });
            }
            // check inline
            if (/bugs/.test(text)) {
                var indexOfBugs = text.search(/bugs/);
                var ruleError = new RuleError("Found bugs.", {
                    index: indexOfBugs // padding of index
                });
                report(node, ruleError);
            }
        }
    };
};
var _default = (exports.default = {
    linter: report,
    fixer: report
});
//# sourceMappingURL=index.js.map
