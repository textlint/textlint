// LICENSE : MIT
"use strict";
import LinterTask from "../task/linter-task";
import TaskRunner from "../task/task-runner";
import { TextlintKernelConstructorOptions } from "../textlint-kernel-interface";

import MessageProcessManager from "../messages/MessageProcessManager";
import { TextlintFilterRuleDescriptors, TextlintRuleDescriptors } from "../descriptor";
import { invariant } from "../util/invariant";
import type { TextlintSourceCode, TextlintPluginProcessor, TextlintResult } from "@textlint/types";

export interface LinterProcessorArgs {
    config: TextlintKernelConstructorOptions;
    configBaseDir?: string;
    ruleDescriptors: TextlintRuleDescriptors;
    filterRuleDescriptors: TextlintFilterRuleDescriptors;
    sourceCode: TextlintSourceCode;
}

export default class LinterProcessor {
    private processor: TextlintPluginProcessor;
    private messageProcessManager: MessageProcessManager;

    /**
     * @param {Processor} processor
     * @param {MessageProcessManager} messageProcessManager
     */
    constructor(processor: TextlintPluginProcessor, messageProcessManager: MessageProcessManager) {
        this.processor = processor;
        this.messageProcessManager = messageProcessManager;
    }

    /**
     * Run linter process
     */
    async process({
        config,
        configBaseDir,
        ruleDescriptors,
        filterRuleDescriptors,
        sourceCode
    }: LinterProcessorArgs): Promise<TextlintResult> {
        const { preProcess, postProcess } = this.processor.processor(sourceCode.ext);
        invariant(
            typeof preProcess === "function" && typeof postProcess === "function",
            "processor should implement {preProcess, postProcess}"
        );
        const task = new LinterTask({
            config,
            ruleDescriptors,
            filterRuleDescriptors,
            sourceCode,
            configBaseDir
        });
        const messages = await TaskRunner.process(task);
        const result = await postProcess(messages, sourceCode.filePath);
        result.messages = this.messageProcessManager.process(result.messages);
        if (result.filePath == null) {
            result.filePath = `<Unknown{sourceCode.ext}>`;
        }
        invariant(result.filePath && result.messages.length >= 0, "postProcess should return { messages, filePath } ");
        return result;
    }
}
