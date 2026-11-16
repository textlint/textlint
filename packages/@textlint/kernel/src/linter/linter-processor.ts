// LICENSE : MIT
"use strict";
import LinterTask from "../task/linter-task.js";
import TaskRunner from "../task/task-runner.js";
import type { OnceRuleStore } from "../task/once-rule.js";
import { TextlintKernelConstructorOptions } from "../textlint-kernel-interface.js";

import MessageProcessManager from "../messages/MessageProcessManager.js";
import { TextlintFilterRuleDescriptors, TextlintRuleDescriptors } from "../descriptor/index.js";
import { invariant } from "../util/invariant.js";
import { profiler } from "../profile/profiler.js";
import type { TextlintSourceCode, TextlintPluginProcessor, TextlintResult } from "@textlint/types";

export interface LinterProcessorArgs {
    config: TextlintKernelConstructorOptions;
    configBaseDir?: string;
    ruleDescriptors: TextlintRuleDescriptors;
    filterRuleDescriptors: TextlintFilterRuleDescriptors;
    sourceCode: TextlintSourceCode;
    onceRuleStore?: OnceRuleStore;
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
        sourceCode,
        onceRuleStore
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
            configBaseDir,
            onceRuleStore
        });
        const messages = await TaskRunner.process(task);
        const processMessages = async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await postProcess(messages as any, sourceCode.filePath);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result.messages = this.messageProcessManager.process(result.messages as any);
            return result;
        };
        const result = profiler.enabled
            ? await profiler.measureAsync("post-process", undefined, processMessages, sourceCode.filePath)
            : await processMessages();
        if (result.filePath == null) {
            result.filePath = `<Unknown{sourceCode.ext}>`;
        }
        invariant(result.filePath && result.messages.length >= 0, "postProcess should return { messages, filePath } ");
        return result;
    }
}
