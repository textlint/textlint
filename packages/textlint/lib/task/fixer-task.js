// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _textlintCoreTask;

function _load_textlintCoreTask() {
    return _textlintCoreTask = _interopRequireDefault(require("./textlint-core-task"));
}

var _ruleCreatorHelper;

function _load_ruleCreatorHelper() {
    return _ruleCreatorHelper = require("../core/rule-creator-helper");
}

var _ruleContext;

function _load_ruleContext() {
    return _ruleContext = _interopRequireDefault(require("../core/rule-context"));
}

var _filterRuleContext;

function _load_filterRuleContext() {
    return _filterRuleContext = _interopRequireDefault(require("../core/filter-rule-context"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var debug = require("debug")("textlint:TextLintCoreTask");

var TextLintCoreTask = function (_CoreTask) {
    _inherits(TextLintCoreTask, _CoreTask);

    /**
     * @param {Config} config
     * @param {RuleCreatorSet} ruleCreatorSet rules and config set
     * @param {RuleCreatorSet} filterRuleCreatorSet filter rules and config set
     * @param {SourceCode} sourceCode
     */
    function TextLintCoreTask(_ref) {
        var config = _ref.config,
            ruleCreatorSet = _ref.ruleCreatorSet,
            filterRuleCreatorSet = _ref.filterRuleCreatorSet,
            sourceCode = _ref.sourceCode;

        _classCallCheck(this, TextLintCoreTask);

        var _this = _possibleConstructorReturn(this, (TextLintCoreTask.__proto__ || Object.getPrototypeOf(TextLintCoreTask)).call(this));

        _this.config = config;
        _this.ruleCreatorSet = ruleCreatorSet;
        _this.filterRuleCreatorSet = filterRuleCreatorSet;
        _this.sourceCode = sourceCode;
        _this._setupRules();
        return _this;
    }

    _createClass(TextLintCoreTask, [{
        key: "start",
        value: function start() {
            this.startTraverser(this.sourceCode);
        }
    }, {
        key: "_setupRules",
        value: function _setupRules() {
            var _this2 = this;

            // rule
            var textLintConfig = this.config;
            var sourceCode = this.sourceCode;
            var report = this.createReporter(sourceCode);
            var ignoreReport = this.createIgnoreReporter(sourceCode);
            // setup "rules" field
            // filter duplicated rules for improving experience
            // see https://github.com/textlint/textlint/issues/219
            var ruleCreatorSet = this.ruleCreatorSet.withoutDuplicated();
            debug("ruleCreatorSet", ruleCreatorSet);
            ruleCreatorSet.forEach(function (_ref2) {
                var ruleId = _ref2.ruleId,
                    rule = _ref2.rule,
                    ruleConfig = _ref2.ruleConfig;

                var ruleContext = new (_ruleContext || _load_ruleContext()).default({
                    ruleId: ruleId,
                    sourceCode: sourceCode,
                    report: report,
                    ignoreReport: ignoreReport,
                    textLintConfig: textLintConfig,
                    ruleConfig: ruleConfig
                });
                var ruleModule = (0, (_ruleCreatorHelper || _load_ruleCreatorHelper()).getFixer)(rule);
                _this2.tryToAddListenRule(ruleModule, ruleContext, ruleConfig);
            });
            // setup "filters" field
            debug("filterRuleCreatorSet", this.filterRuleCreatorSet);
            this.filterRuleCreatorSet.forEach(function (_ref3) {
                var ruleId = _ref3.ruleId,
                    rule = _ref3.rule,
                    ruleConfig = _ref3.ruleConfig;

                var ruleContext = new (_filterRuleContext || _load_filterRuleContext()).default({
                    ruleId: ruleId,
                    sourceCode: sourceCode,
                    ignoreReport: ignoreReport,
                    textLintConfig: textLintConfig
                });
                // "filters" rule is the same with "rules"
                var ruleModule = (0, (_ruleCreatorHelper || _load_ruleCreatorHelper()).getFilter)(rule);
                _this2.tryToAddListenRule(ruleModule, ruleContext, ruleConfig);
            });
        }
    }]);

    return TextLintCoreTask;
}((_textlintCoreTask || _load_textlintCoreTask()).default);

exports.default = TextLintCoreTask;
//# sourceMappingURL=fixer-task.js.map