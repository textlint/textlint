import CoreTask from "./textlint-core-task";
import { TextlintKernelConstructorOptions, TextlintKernelFilterRule, TextlintKernelRule } from "../textlint-kernel-interface";
import SourceCode from "../core/source-code";
export interface TextLintCoreTaskArgs {
    config: TextlintKernelConstructorOptions;
    rules: TextlintKernelRule[];
    filterRules: TextlintKernelFilterRule[];
    sourceCode: SourceCode;
    configBaseDir?: string;
}
export default class TextLintCoreTask extends CoreTask {
    config: TextlintKernelConstructorOptions;
    rules: TextlintKernelRule[];
    filterRules: TextlintKernelFilterRule[];
    sourceCode: SourceCode;
    configBaseDir?: string;
    /**
     * @param {Config} config
     * @param {string} [configBaseDir]
     * @param {TextlintKernelRule[]} rules rules and config set
     * @param {TextlintKernelFilterRule[]} filterRules rules filter rules and config set
     * @param {SourceCode} sourceCode
     */
    constructor({config, configBaseDir, rules, filterRules, sourceCode}: TextLintCoreTaskArgs);
    start(): void;
    _setupRules(): void;
}
