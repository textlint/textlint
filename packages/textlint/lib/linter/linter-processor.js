// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _assert;

function _load_assert() {
    return _assert = _interopRequireDefault(require("assert"));
}

var _linterTask;

function _load_linterTask() {
    return _linterTask = _interopRequireDefault(require("../task/linter-task"));
}

var _taskRunner;

function _load_taskRunner() {
    return _taskRunner = _interopRequireDefault(require("../task/task-runner"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LinterProcessor = function () {
    /**
     * @param {Processor} processor
     * @param {MessageProcessManager} messageProcessManager
     */
    function LinterProcessor(processor, messageProcessManager) {
        _classCallCheck(this, LinterProcessor);

        this.processor = processor;
        this.messageProcessManager = messageProcessManager;
    }

    /**
     * Run linter process
     * @param {Config} config
     * @param {RuleCreatorSet} ruleCreatorSet
     * @param {RuleCreatorSet} filterRuleCreatorSet
     * @param {SourceCode} sourceCode
     * @returns {Promise.<TextLintResult>}
     */


    _createClass(LinterProcessor, [{
        key: "process",
        value: function process(_ref) {
            var _this = this;

            var config = _ref.config,
                ruleCreatorSet = _ref.ruleCreatorSet,
                filterRuleCreatorSet = _ref.filterRuleCreatorSet,
                sourceCode = _ref.sourceCode;

            (0, (_assert || _load_assert()).default)(config && ruleCreatorSet && sourceCode);

            var _processor$processor = this.processor.processor(sourceCode.ext),
                preProcess = _processor$processor.preProcess,
                postProcess = _processor$processor.postProcess;

            (0, (_assert || _load_assert()).default)(typeof preProcess === "function" && typeof postProcess === "function", "processor should implement {preProcess, postProcess}");
            var task = new (_linterTask || _load_linterTask()).default({
                config: config,
                ruleCreatorSet: ruleCreatorSet,
                filterRuleCreatorSet: filterRuleCreatorSet,
                sourceCode: sourceCode
            });
            return (_taskRunner || _load_taskRunner()).default.process(task).then(function (messages) {
                var result = postProcess(messages, sourceCode.filePath);
                result.messages = _this.messageProcessManager.process(result.messages);
                if (result.filePath == null) {
                    result.filePath = "<Unkown" + sourceCode.ext + ">";
                }
                (0, (_assert || _load_assert()).default)(result.filePath && result.messages.length >= 0, "postProcess should return { messages, filePath } ");
                return result;
            });
        }
    }]);

    return LinterProcessor;
}();

exports.default = LinterProcessor;
//# sourceMappingURL=linter-processor.js.map