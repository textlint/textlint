import { TextlintKernel, TextlintTypes } from "@textlint/kernel";
import { RuleCreatorSet } from "./core/rule-creator-set";
import { PluginCreatorSet } from "./core/plugin-creator-set";
import { Config } from "./config/config";
/**
 * @class {TextLintCore}
 */
export declare class TextLintCore {
    filterRuleCreatorSet: RuleCreatorSet;
    ruleCreatorSet: RuleCreatorSet;
    pluginCreatorSet: PluginCreatorSet;
    kernel: TextlintKernel;
    config: Partial<Config>;
    defaultPlugins: {
        markdown: TextlintTypes.TextlintPluginCreator;
        text: TextlintTypes.TextlintPluginCreator;
    };
    constructor(config?: Partial<Config>);
    /**
     * Use setupPlugins insteadof it.
     *
     * ````
     * textlint.setupPlugins({
     *   yourPluginName: yourPlugin
     * });
     * ````
     *
     * @param {*} Processor
     * @deprecated
     *
     * It will be removed until textlint@10
     */
    addProcessor(Processor: TextlintTypes.TextlintKernelProcessorConstructor): void;
    /**
     * register Processors
     * @param {Object} plugins
     * @param {Object} [pluginsConfig]
     */
    setupPlugins(plugins?: {}, pluginsConfig?: {}): void;
    /**
     * Register rules and rulesConfig.
     * if want to release rules, please call {@link resetRules}.
     * @param {object} rules rule objects array
     * @param {object} [rulesConfig] ruleConfig is object
     */
    setupRules(rules?: {}, rulesConfig?: {}): void;
    /**
     * Register filterRules and filterRulesConfig.
     * if want to release rules, please call {@link resetRules}.
     * @param {object} rules rule objects array
     * @param {object} [rulesConfig] ruleConfig is object
     */
    setupFilterRules(rules?: {}, rulesConfig?: {}): void;
    /**
     * Remove all registered rule and clear messages.
     */
    resetRules(): void;
    /**
     * lint text by registered rules.
     * The result contains target filePath and error messages.
     * @param {string} text
     * @param {string} ext ext is extension. default: .txt
     * @returns {Promise.<TextlintResult>}
     */
    lintText(text: string, ext?: string): Promise<TextlintTypes.TextlintResult>;
    /**
     * lint markdown text by registered rules.
     * The result contains target filePath and error messages.
     * @param {string} text markdown format text
     * @returns {Promise.<TextlintResult>}
     */
    lintMarkdown(text: string): Promise<TextlintTypes.TextlintResult>;
    /**
     * lint file and return result object
     * @param {string} filePath
     * @returns {Promise.<TextlintResult>} result
     */
    lintFile(filePath: string): Promise<TextlintTypes.TextlintResult>;
    /**
     * fix file and return fix result object
     * @param {string} filePath
     * @returns {Promise.<TextlintFixResult>}
     */
    fixFile(filePath: string): Promise<TextlintTypes.TextlintFixResult>;
    /**
     * fix texts and return fix result object
     * @param {string} text
     * @param {string} ext
     * @returns {Promise.<TextlintFixResult>}
     */
    fixText(text: string, ext?: string): Promise<TextlintTypes.TextlintFixResult>;
    /**
     * @private
     */
    _mergeSetupOptions(options: {
        ext: string;
    } | {
        ext: any;
        filePath: any;
    }): any;
}
