import { TextlintKernelConstructorOptions, TextlintKernelFilterRule, TextlintKernelProcessor, TextlintKernelRule } from "../textlint-kernel-interface";
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
    private processor;
    private messageProcessManager;
    /**
     * @param {Processor} processor
     * @param {MessageProcessManager} messageProcessManager
     */
    constructor(processor: TextlintKernelProcessor, messageProcessManager: MessageProcessManager);
    /**
     * Run linter process
     * @param {Config} config
     * @param {string} [configBaseDir
     * @param {TextlintKernelRule[]} [rules]
     * @param {TextlintKernelFilterRule[]} [filterRules]
     * @param {SourceCode} sourceCode
     * @returns {Promise.<TextlintResult>}
     */
    process({config, configBaseDir, rules, filterRules, sourceCode}: LinterProcessorArgs): Promise<{
        messages: any[];
        filePath: string;
    }>;
}
