import { TextLintCore } from "./../textlint-core";
import { RuleMap } from "./rule-map";
import { PluginMap } from "./processor-map";
import { Config } from "../config/config";
import { TextLintModuleLoader } from "./textlint-module-loader";
import { ExecuteFileBackerManager } from "./execute-file-backer-manager";
import { TextlintTypes } from "@textlint/kernel";
/**
 * Core of TextLintEngine.
 * It is internal user.
 *
 * Hackable adaptor
 *
 * - executeOnFiles
 * - executeOnText
 * - formatResults
 *
 * There are hackable by `executor` option.
 */
export declare class TextLintEngineCore {
    filerRuleMap: any;
    availableExtensions: any;
    moduleLoader: TextLintModuleLoader;
    pluginMap: PluginMap;
    filterRuleMap: RuleMap;
    ruleMap: RuleMap;
    executeFileBackerManger: ExecuteFileBackerManager;
    executor: {
        onFile: Function;
        onText: Function;
        onFormat: Function;
    };
    textlint: TextLintCore;
    config: Config;
    /**
     * Process files are wanted to lint.
     * TextLintEngine is a wrapper of textlint.js.
     * Aim to be called from cli with cli options.
     * @param {Config|Object} [options] the options is command line options or Config object.
     * @param {{ onFile: Function, onText: Function, onFormat:Function }} [executor] executor are injectable function.
     * @constructor
     */
    constructor(options: Config | object, executor: {
        onFile: Function;
        onText: Function;
        onFormat: Function;
    });
    /**
     * @deprecated remove this method
     */
    setRulesBaseDirectory(): void;
    /**
     * load plugin manually
     * Note: it high cost, please use config
     * @param {string} pluginName
     * @deprecated use Constructor(config) insteadof it
     */
    loadPlugin(pluginName: string): void;
    /**
     * load plugin manually
     * Note: it high cost, please use config
     * @param {string} presetName
     * @deprecated use Constructor(config) insteadof it
     */
    loadPreset(presetName: string): void;
    /**
     * load rule manually
     * Note: it high cost, please use config
     * @param {string} ruleName
     * @deprecated use Constructor(config) insteadof it
     */
    loadRule(ruleName: string): void;
    /**
     * load filter rule manually
     * Note: it high cost, please use config
     * @param {string} ruleName
     * @deprecated use Constructor(config) insteadof it
     */
    loadFilerRule(ruleName: string): void;
    /**
     * Update rules from current config
     * @private
     */
    _setupRules(): void;
    /**
     * Remove all registered rule and clear messages.
     * @private
     */
    resetRules(): void;
    /**
     * Executes the current configuration on an array of file and directory names.
     * @param {String[]}  files An array of file and directory names.
     * @returns {Promise<TextlintResult[]>} The results for all files that were linted.
     */
    executeOnFiles(files: string[]): Promise<TextlintTypes.TextlintResult[]>;
    /**
     * If want to lint a text, use it.
     * But, if you have a target file, use {@link executeOnFiles} instead of it.
     * @param {string} text linting text content
     * @param {string} ext ext is a type for linting. default: ".txt"
     * @returns {Promise<TextlintResult[]>}
     */
    executeOnText(text: string, ext?: string): Promise<TextlintTypes.TextlintResult[]>;
    /**
     * format {@link results} and return output text.
     * @param {TextlintResult[]} results the collection of result
     * @returns {string} formatted output text
     * @example
     *  console.log(formatResults(results));
     */
    formatResults(results: TextlintTypes.TextlintResult[]): string;
    /**
     * Checks if the given message is an error message.
     * @param {TextlintMessage} message The message to check.
     * @returns {boolean} Whether or not the message is an error message.
     */
    isErrorMessage(message: TextlintTypes.TextlintMessage): boolean;
    /**
     * Checks if the given results contain error message.
     * If there is even one error then return true.
     * @param {TextlintResult[]} results Linting result collection
     * @returns {Boolean} Whether or not the results contain error message.
     */
    isErrorResults(results: TextlintTypes.TextlintResult[]): boolean;
    /**
     * @returns {boolean}
     */
    hasRuleAtLeastOne(): boolean;
}
