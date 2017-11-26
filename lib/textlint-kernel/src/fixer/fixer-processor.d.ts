import SourceCode from "../core/source-code";
import { TextlintFixResult, TextlintKernelConstructorOptions, TextlintKernelFilterRule, TextlintKernelProcessor, TextlintKernelRule } from "../textlint-kernel-interface";
import MessageProcessManager from "../messages/MessageProcessManager";
export interface FixerProcessorProcessArgs {
    config: TextlintKernelConstructorOptions;
    configBaseDir?: string;
    rules?: TextlintKernelRule[];
    filterRules?: TextlintKernelFilterRule[];
    sourceCode: SourceCode;
}
export default class FixerProcessor {
    private processor;
    private messageProcessManager;
    /**
     * @param {Processor} processor
     * @param {MessageProcessManager} messageProcessManager
     */
    constructor(processor: TextlintKernelProcessor, messageProcessManager: MessageProcessManager);
    /**
     * Run fixer process
     * @param {Config} config
     * @param {string} [configBaseDir]
     * @param {TextlintKernelRule[]} [rules]
     * @param {TextlintKernelFilterRule[]} [filterRules]
     * @param {SourceCode} sourceCode
     * @returns {Promise.<TextlintFixResult>}
     */
    process({config, configBaseDir, rules, filterRules, sourceCode}: FixerProcessorProcessArgs): Promise<TextlintFixResult>;
}
