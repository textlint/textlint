// LICENSE : MIT
"use strict";
import assert from "assert";
import LinterTask from "../task/linter-task";
import TaskRunner from "../task/task-runner";
export default class LinterProcessor {
    /**
     * @param {Processor} processor
     * @param {MessageProcessManager} messageProcessManager
     */
    constructor(processor, messageProcessManager) {
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
    process({config, ruleCreatorSet, filterRuleCreatorSet, sourceCode}) {
        assert(config && ruleCreatorSet && sourceCode);
        const {preProcess, postProcess} = this.processor.processor(sourceCode.ext);
        assert(typeof preProcess === "function" && typeof postProcess === "function",
            "processor should implement {preProcess, postProcess}");
        const task = new LinterTask({
            config,
            ruleCreatorSet,
            filterRuleCreatorSet,
            sourceCode
        });
        return TaskRunner.process(task).then(messages => {
            const result = postProcess(messages, sourceCode.filePath);
            result.messages = this.messageProcessManager.process(result.messages);
            if (result.filePath == null) {
                result.filePath = `<Unkown${sourceCode.ext}>`;
            }
            assert(result.filePath && result.messages.length >= 0, "postProcess should return { messages, filePath } ");
            return result;
        });
    }
}
