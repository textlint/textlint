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

var _fixerTask;

function _load_fixerTask() {
    return _fixerTask = _interopRequireDefault(require("../task/fixer-task"));
}

var _sourceCode;

function _load_sourceCode() {
    return _sourceCode = _interopRequireDefault(require("../core/source-code"));
}

var _sourceCodeFixer;

function _load_sourceCodeFixer() {
    return _sourceCodeFixer = _interopRequireDefault(require("../fixer/source-code-fixer"));
}

var _taskRunner;

function _load_taskRunner() {
    return _taskRunner = _interopRequireDefault(require("../task/task-runner"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debug = require("debug")("textlint:fixer-processor");

var FixerProcessor = function () {
    /**
     * @param {Processor} processor
     * @param {MessageProcessManager} messageProcessManager
     */
    function FixerProcessor(processor, messageProcessManager) {
        _classCallCheck(this, FixerProcessor);

        this.processor = processor;
        this.messageProcessManager = messageProcessManager;
    }

    /**
     * Run fixer process
     * @param {Config} config
     * @param {RuleCreatorSet} ruleCreatorSet
     * @param {RuleCreatorSet} filterRuleCreatorSet
     * @param {SourceCode} sourceCode
     * @returns {Promise.<TextLintFixResult>}
     */


    _createClass(FixerProcessor, [{
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
            // messages


            var resultFilePath = sourceCode.filePath;
            // applied fixing messages
            // Revert = Sequentially apply applied message to applied output
            // SourceCodeFixer.sequentiallyApplyFixes(fixedOutput, result.applyingMessages);
            var applyingMessages = [];
            // not applied fixing messages
            var remainingMessages = [];
            // original means original for applyingMessages and remainingMessages
            // pre-applyingMessages + remainingMessages
            var originalMessages = [];
            var fixerProcessList = ruleCreatorSet.mapFixer(function (fixerRuleCreatorSet) {
                return function (sourceText) {
                    // create new SourceCode object
                    var newSourceCode = new (_sourceCode || _load_sourceCode()).default({
                        text: sourceText,
                        ast: preProcess(sourceText),
                        filePath: resultFilePath,
                        ext: sourceCode.ext
                    });
                    // create new Task
                    var task = new (_fixerTask || _load_fixerTask()).default({
                        config: config,
                        ruleCreatorSet: fixerRuleCreatorSet,
                        filterRuleCreatorSet: filterRuleCreatorSet,
                        sourceCode: newSourceCode
                    });

                    return (_taskRunner || _load_taskRunner()).default.process(task).then(function (messages) {
                        var result = postProcess(messages, sourceCode.filePath);
                        result.messages = _this.messageProcessManager.process(result.messages);
                        if (result.filePath == null) {
                            result.filePath = "<Unkown" + sourceCode.ext + ">";
                        }
                        resultFilePath = result.filePath;
                        var applied = (_sourceCodeFixer || _load_sourceCodeFixer()).default.applyFixes(newSourceCode, result.messages);
                        // add messages
                        Array.prototype.push.apply(applyingMessages, applied.applyingMessages);
                        Array.prototype.push.apply(remainingMessages, applied.remainingMessages);
                        Array.prototype.push.apply(originalMessages, applied.messages);
                        // if not fixed, still use current sourceText
                        if (!applied.fixed) {
                            return sourceText;
                        }
                        // if fixed, use fixed text at next
                        return applied.output;
                    });
                };
            });

            var promiseTask = fixerProcessList.reduce(function (promise, fixerProcess) {
                return promise.then(function (sourceText) {
                    return fixerProcess(sourceText);
                });
            }, Promise.resolve(sourceCode.text));

            return promiseTask.then(function (output) {
                debug("Finish Processing: " + resultFilePath);
                debug("applyingMessages: " + applyingMessages.length);
                debug("remainingMessages: " + remainingMessages.length);
                return {
                    filePath: resultFilePath,
                    output: output,
                    messages: originalMessages,
                    applyingMessages: applyingMessages,
                    remainingMessages: remainingMessages
                };
            });
        }
    }]);

    return FixerProcessor;
}();

exports.default = FixerProcessor;
//# sourceMappingURL=fixer-processor.js.map