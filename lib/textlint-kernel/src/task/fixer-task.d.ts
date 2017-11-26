import CoreTask from "./textlint-core-task";
import { TextlintKernelConstructorOptions, TextlintKernelFilterRule, TextlintKernelRule } from "../textlint-kernel-interface";
import SourceCode from "../core/source-code";
export interface TextLintCoreTaskArgs {
    config: TextlintKernelConstructorOptions;
    fixerRule: TextlintKernelRule;
    filterRules: TextlintKernelFilterRule[];
    sourceCode: SourceCode;
    configBaseDir?: string;
}
export default class TextLintCoreTask extends CoreTask {
    config: TextlintKernelConstructorOptions;
    fixerRule: TextlintKernelRule;
    filterRules: TextlintKernelFilterRule[];
    sourceCode: SourceCode;
    configBaseDir?: string;
    /**
     * @param {Config} config
     * @param {string} [configBaseDir]
     * @param {TextlintKernelRule} fixerRule rules has fixer
     * @param {TextlintKernelFilterRule[]} filterRules filter rules and config set
     * @param {SourceCode} sourceCode
     */
    constructor({config, configBaseDir, fixerRule, filterRules, sourceCode}: TextLintCoreTaskArgs);
    start(): void;
    _setupRules(): void;
}
