// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var debug = require("debug")("textlint:fixer-processor");
var assert = require("assert");
var fixer_task_1 = require("../task/fixer-task");
var source_code_1 = require("../core/source-code");
var source_code_fixer_1 = require("./source-code-fixer");
var task_runner_1 = require("../task/task-runner");
var rule_creator_helper_1 = require("../core/rule-creator-helper");
var FixerProcessor = /** @class */ (function () {
    /**
     * @param {Processor} processor
     * @param {MessageProcessManager} messageProcessManager
     */
    function FixerProcessor(processor, messageProcessManager) {
        this.processor = processor;
        this.messageProcessManager = messageProcessManager;
    }
    /**
     * Run fixer process
     * @param {Config} config
     * @param {string} [configBaseDir]
     * @param {TextlintKernelRule[]} [rules]
     * @param {TextlintKernelFilterRule[]} [filterRules]
     * @param {SourceCode} sourceCode
     * @returns {Promise.<TextlintFixResult>}
     */
    FixerProcessor.prototype.process = function (_a) {
        var _this = this;
        var config = _a.config, configBaseDir = _a.configBaseDir, _b = _a.rules, rules = _b === void 0 ? [] : _b, _c = _a.filterRules, filterRules = _c === void 0 ? [] : _c, sourceCode = _a.sourceCode;
        assert(config && Array.isArray(rules) && Array.isArray(filterRules) && sourceCode);
        var _d = this.processor.processor(sourceCode.ext), preProcess = _d.preProcess, postProcess = _d.postProcess;
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
        var fixerProcessList = rules
            .filter(function (rule) {
            return rule_creator_helper_1.hasFixer(rule.rule);
        })
            .map(function (fixerRule) {
            return function (sourceText) {
                // create new SourceCode object
                var newSourceCode = new source_code_1.default({
                    text: sourceText,
                    ast: preProcess(sourceText),
                    filePath: resultFilePath,
                    ext: sourceCode.ext
                });
                // create new Task
                var task = new fixer_task_1.default({
                    config: config,
                    fixerRule: fixerRule,
                    filterRules: filterRules,
                    sourceCode: newSourceCode,
                    configBaseDir: configBaseDir
                });
                return task_runner_1.default.process(task).then(function (messages) {
                    var result = postProcess(messages, sourceCode.filePath);
                    var filteredResult = {
                        messages: _this.messageProcessManager.process(result.messages),
                        filePath: result.filePath ? result.filePath : "<Unkown" + sourceCode.ext + ">"
                    };
                    // TODO: should be removed resultFilePath
                    resultFilePath = filteredResult.filePath;
                    var applied = source_code_fixer_1.default.applyFixes(newSourceCode, filteredResult.messages);
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
                filePath: resultFilePath ? resultFilePath : "<Unkown" + sourceCode.ext + ">",
                output: output,
                messages: originalMessages,
                applyingMessages: applyingMessages,
                remainingMessages: remainingMessages
            };
        });
    };
    return FixerProcessor;
}());
exports.default = FixerProcessor;
