// LICENSE : MIT
"use strict";
import * as assert from "assert";
import LinterTask from "../task/linter-task";
import TaskRunner from "../task/task-runner";
import {
    TextlintKernelConstructorOptions,
    TextlintKernelFilterRule,
    TextlintKernelProcessor,
    TextlintKernelRule
} from "../textlint-kernel-interface";
import MessageProcessManager from "../messages/MessageProcessManager";
import SourceCode from "../core/source-code";

export interface LinterProcessorArgs {
    config: TextlintKernelConstructorOptions;
    configBaseDir?: string;
    rules?: TextlintKernelRule[];
    filterRules?: TextlintKernelFilterRule[];
    sourceCode: SourceCode;
}

export default class LinterProcessor {
    private processor: TextlintKernelProcessor;
    private messageProcessManager: MessageProcessManager;

    /**
     * @param {Processor} processor
     * @param {MessageProcessManager} messageProcessManager
     */
    constructor(processor: TextlintKernelProcessor, messageProcessManager: MessageProcessManager) {
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
    process({ config, configBaseDir, rules = [], filterRules = [], sourceCode }: LinterProcessorArgs) {
        assert(config && Array.isArray(rules) && Array.isArray(filterRules) && sourceCode);
        const { preProcess, postProcess } = this.processor.processor(sourceCode.ext);
        assert(
            typeof preProcess === "function" && typeof postProcess === "function",
            "processor should implement {preProcess, postProcess}"
        );
        const task = new LinterTask({
            config,
            rules,
            filterRules,
            sourceCode,
            configBaseDir
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
