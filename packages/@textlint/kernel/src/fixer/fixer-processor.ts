// LICENSE : MIT
"use strict";

import type { TextlintFixResult, TextlintMessage, TextlintPluginProcessor, TextlintSourceCode } from "@textlint/types";
import FixerTask from "../task/fixer-task.js";
import TaskRunner from "../task/task-runner.js";
import { TextlintKernelConstructorOptions } from "../textlint-kernel-interface.js";
import MessageProcessManager from "../messages/MessageProcessManager.js";
import { TextlintFilterRuleDescriptors, TextlintRuleDescriptors } from "../descriptor/index.js";
import { TextlintSourceCodeImpl } from "../context/TextlintSourceCodeImpl.js";
import _debug from "debug";
import { applyFixesToSourceCode } from "@textlint/source-code-fixer";
import { invariant } from "../util/invariant.js";
import { parseByPlugin } from "../util/parse-by-plugin.js";

const debug = _debug("textlint:fixer-processor");

export interface FixerProcessorProcessArgs {
    config: TextlintKernelConstructorOptions;
    configBaseDir?: string;
    ruleDescriptors: TextlintRuleDescriptors;
    filterRules: TextlintFilterRuleDescriptors;
    sourceCode: TextlintSourceCode;
}

export default class FixerProcessor {
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
     * Run fixer process
     * @param {Config} config
     * @param {string} [configBaseDir]
     * @param {TextlintKernelRule[]} [rules]
     * @param {TextlintKernelFilterRule[]} [filterRules]
     * @param {SourceCode} sourceCode
     * @returns {Promise.<TextlintFixResult>}
     */
    async process({
        config,
        configBaseDir,
        ruleDescriptors,
        filterRules,
        sourceCode
    }: FixerProcessorProcessArgs): Promise<TextlintFixResult> {
        invariant(sourceCode);
        const { preProcess, postProcess } = this.processor.processor(sourceCode.ext);
        // messages
        let resultFilePath = sourceCode.filePath;
        // applied fixing messages
        // Revert = Sequentially apply message to applied output
        // SourceCodeFixer.sequentiallyApplyFixes(fixedOutput, result.applyingMessages);
        const applyingMessages: TextlintMessage[] = [];
        // not applied fixing messages
        const remainingMessages: TextlintMessage[] = [];
        // original means original for applyingMessages and remainingMessages
        // pre-applyingMessages + remainingMessages
        const originalMessages: TextlintMessage[] = [];
        // apply fixes to sourceText sequentially
        let sourceText = sourceCode.text;
        for (const ruleDescriptor of ruleDescriptors.fixableDescriptors) {
            const parseResult = await parseByPlugin({
                preProcess,
                sourceText,
                filePath: sourceCode.filePath
            });
            if (parseResult instanceof Error) {
                // --fix can not report error as lint error
                // Because fix's result has output content, It makes confuse user.
                throw parseResult;
            }
            const newSourceCode = new TextlintSourceCodeImpl({
                text: parseResult.text,
                ast: parseResult.ast,
                filePath: resultFilePath,
                ext: sourceCode.ext
            });
            // create new Task
            const task = new FixerTask({
                config,
                fixableRuleDescriptor: ruleDescriptor,
                filterRuleDescriptors: filterRules,
                sourceCode: newSourceCode,
                configBaseDir
            });

            const messages = await TaskRunner.process(task);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await postProcess(messages as any, sourceCode.filePath);
            const filteredResult = {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                messages: this.messageProcessManager.process(result.messages as any),
                filePath: result.filePath ? result.filePath : `<Unknown{sourceCode.ext}>`
            };
            // TODO: should be removed resultFilePath
            resultFilePath = filteredResult.filePath;
            const applied = applyFixesToSourceCode(newSourceCode, filteredResult.messages);
            // add messages
            Array.prototype.push.apply(applyingMessages, applied.applyingMessages);
            Array.prototype.push.apply(remainingMessages, applied.remainingMessages);
            Array.prototype.push.apply(originalMessages, applied.messages);
            // if not fixed, still use current sourceText
            if (!applied.fixed) {
                continue;
            }
            // if fixed, use fixed text at next
            sourceText = applied.output;
        }
        debug(`Finish Processing: ${resultFilePath}`);
        debug(`applyingMessages: ${applyingMessages.length}`);
        debug(`remainingMessages: ${remainingMessages.length}`);
        return {
            filePath: resultFilePath ? resultFilePath : `<Unknown{sourceCode.ext}>`,
            output: sourceText,
            messages: originalMessages,
            applyingMessages,
            remainingMessages
        };
    }
}
