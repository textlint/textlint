// LICENSE : MIT
"use strict";
const debug = require("debug")("textlint:fixer-processor");
import assert from "assert";
import FixerTask from "../task/fixer-task";
import SourceCode from "../core/source-code";
import SourceCodeFixer from "../fixer/source-code-fixer";
import TaskRunner from "../task/task-runner";
export default class FixerProcessor {
    /**
     * @param {Processor} processor
     * @param {MessageProcessManager} messageProcessManager
     */
    constructor(processor, messageProcessManager) {
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
    process({config, ruleCreatorSet, filterRuleCreatorSet, sourceCode}) {
        assert(config && ruleCreatorSet && sourceCode);
        const {preProcess, postProcess} = this.processor.processor(sourceCode.ext);
        // messages
        let resultFilePath = sourceCode.filePath;
        // applied fixing messages
        // Revert = Sequentially apply applied message to applied output
        // SourceCodeFixer.sequentiallyApplyFixes(fixedOutput, result.applyingMessages);
        const applyingMessages = [];
        // not applied fixing messages
        const remainingMessages = [];
        // original means original for applyingMessages and remainingMessages
        // pre-applyingMessages + remainingMessages
        const originalMessages = [];
        const fixerProcessList = ruleCreatorSet.mapFixer(fixerRuleCreatorSet => {
            return (sourceText) => {
                // create new SourceCode object
                const newSourceCode = new SourceCode({
                    text: sourceText,
                    ast: preProcess(sourceText),
                    filePath: resultFilePath,
                    ext: sourceCode.ext
                });
                // create new Task
                const task = new FixerTask({
                    config,
                    ruleCreatorSet: fixerRuleCreatorSet,
                    filterRuleCreatorSet,
                    sourceCode: newSourceCode
                });

                return TaskRunner.process(task).then(messages => {
                    const result = postProcess(messages, sourceCode.filePath);
                    result.messages = this.messageProcessManager.process(result.messages);
                    if (result.filePath == null) {
                        result.filePath = `<Unkown${sourceCode.ext}>`;
                    }
                    resultFilePath = result.filePath;
                    const applied = SourceCodeFixer.applyFixes(newSourceCode, result.messages);
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

        const promiseTask = fixerProcessList.reduce((promise, fixerProcess) => {
            return promise.then((sourceText) => {
                return fixerProcess(sourceText);
            });
        }, Promise.resolve(sourceCode.text));

        return promiseTask.then(output => {
            debug(`Finish Processing: ${resultFilePath}`);
            debug(`applyingMessages: ${applyingMessages.length}`);
            debug(`remainingMessages: ${remainingMessages.length}`);
            return {
                filePath: resultFilePath,
                output,
                messages: originalMessages,
                applyingMessages,
                remainingMessages
            };
        });
    }
}
