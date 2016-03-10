// LICENSE : MIT
"use strict";
import assert from "assert";
import LinterTask from "../task/linter-task";
import TaskRunner from "../task/task-runner";
export default class LinterProcessor {
    constructor(processor) {
        this.processor = processor;
    }

    /**
     * Run linter process
     * @param {Config} config
     * @param {RuleCreatorSet} ruleCreatorSet
     * @param {SourceCode} sourceCode
     * @returns {Promise.<TextLintResult>}
     */
    process({config, ruleCreatorSet, sourceCode}) {
        assert(config && ruleCreatorSet && sourceCode);
        const {preProcess, postProcess} = this.processor.processor(sourceCode.ext);
        assert(typeof preProcess === "function" && typeof postProcess === "function",
            "processor should implement {preProcess, postProcess}");
        const task = new LinterTask({
            config,
            ruleCreatorSet,
            sourceCode
        });
        return TaskRunner.process(task).then(messages => {
            const result = postProcess(messages, sourceCode.filePath);
            if (result.filePath == null) {
                result.filePath = `<Unkown${sourceCode.ext}>`;
            }
            assert(result.filePath && result.messages.length >= 0, "postProcess should return { messages, filePath } ");
            return result;
        });
    }
}
