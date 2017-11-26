// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var linter_task_1 = require("../task/linter-task");
var task_runner_1 = require("../task/task-runner");
var LinterProcessor = /** @class */ (function () {
    /**
     * @param {Processor} processor
     * @param {MessageProcessManager} messageProcessManager
     */
    function LinterProcessor(processor, messageProcessManager) {
        this.processor = processor;
        this.messageProcessManager = messageProcessManager;
    }
    /**
     * Run linter process
     * @param {Config} config
     * @param {string} [configBaseDir
     * @param {TextlintKernelRule[]} [rules]
     * @param {TextlintKernelFilterRule[]} [filterRules]
     * @param {SourceCode} sourceCode
     * @returns {Promise.<TextlintResult>}
     */
    LinterProcessor.prototype.process = function (_a) {
        var _this = this;
        var config = _a.config, configBaseDir = _a.configBaseDir, _b = _a.rules, rules = _b === void 0 ? [] : _b, _c = _a.filterRules, filterRules = _c === void 0 ? [] : _c, sourceCode = _a.sourceCode;
        assert(config && Array.isArray(rules) && Array.isArray(filterRules) && sourceCode);
        var _d = this.processor.processor(sourceCode.ext), preProcess = _d.preProcess, postProcess = _d.postProcess;
        assert(typeof preProcess === "function" && typeof postProcess === "function", "processor should implement {preProcess, postProcess}");
        var task = new linter_task_1.default({
            config: config,
            rules: rules,
            filterRules: filterRules,
            sourceCode: sourceCode,
            configBaseDir: configBaseDir
        });
        return task_runner_1.default.process(task).then(function (messages) {
            var result = postProcess(messages, sourceCode.filePath);
            result.messages = _this.messageProcessManager.process(result.messages);
            if (result.filePath == null) {
                result.filePath = "<Unkown" + sourceCode.ext + ">";
            }
            assert(result.filePath && result.messages.length >= 0, "postProcess should return { messages, filePath } ");
            return result;
        });
    };
    return LinterProcessor;
}());
exports.default = LinterProcessor;
