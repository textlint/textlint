// LICENSE : MIT
"use strict";
import { TextLintFormatterOption } from "../textlint-interface";

const path = require("path");
const debug = require("debug")("textlint:engine-core");
import { TextLintCore } from "../textlint-core";
import { RuleMap } from "./rule-map";
import { PluginMap } from "./processor-map";
import { Config } from "../config/config";
import { pathsToGlobPatterns, findFiles, separateByAvailability } from "../util/find-util";
import { TextLintModuleLoader } from "./textlint-module-loader";
import { ExecuteFileBackerManager } from "./execute-file-backer-manager";
import { CacheBacker } from "./execute-file-backers/cache-backer";
import { SeverityLevel } from "../shared/type/SeverityLevel";
import { TextlintMessage, TextlintResult } from "@textlint/kernel";

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
export abstract class AbstractTextLintEngine<LintResult extends TextlintResult> {
    filerRuleMap: any;
    availableExtensions: any;
    moduleLoader: TextLintModuleLoader;
    pluginMap: PluginMap;
    filterRuleMap: RuleMap;
    ruleMap: RuleMap;
    executeFileBackerManger: ExecuteFileBackerManager;
    textlint: TextLintCore;
    config: Config;
    // abstract interface
    // Each engines should be implemented these
    /**
     * @param {TextLintCore} textlintCore
     * @returns {function()}
     */
    abstract onFile: (textlintCore: TextLintCore) => ((filePath: string) => Promise<LintResult>);
    /**
     * @param {TextLintCore} textlintCore
     * @returns {function()}
     */
    abstract onText: (textlintCore: TextLintCore) => ((text: string, ext?: string) => Promise<LintResult>);
    /**
     * @param {TextLintFormatterOption} formatterConfig
     */
    abstract onFormat: (formatterConfig: TextLintFormatterOption) => ((results: LintResult[]) => string);

    /**
     * Process files are wanted to lint.
     * TextLintEngine is a wrapper of textlint.js.
     * Aim to be called from cli with cli options.
     * @param {Config|Object} [options] the options is command line options or Config object.
     * @constructor
     */
    constructor(options?: Config | object) {
        /**
         * @type {Config}
         */
        if (options instanceof Config) {
            // Almost internal use-case
            this.config = options;
        } else {
            this.config = Config.initWithAutoLoading(options);
        }
        /**
         * @type {TextLintCore}
         * @private
         */
        this.textlint = new TextLintCore(this.config);
        /**
         * @type {ExecuteFileBackerManager}
         * @private
         */
        this.executeFileBackerManger = new ExecuteFileBackerManager();
        const cacheBaker = new CacheBacker(this.config);
        if (this.config.cache) {
            this.executeFileBackerManger.add(cacheBaker);
        } else {
            cacheBaker.destroyCache();
        }
        /**
         * @type {RuleMap} ruleMap is used for linting/fixer
         * @private
         */
        this.ruleMap = new RuleMap();
        /**
         * @type {RuleMap} filerRuleMap is used for filtering
         * @private
         */
        this.filterRuleMap = new RuleMap();
        /**
         * @type {PluginMap}
         * @private
         */
        this.pluginMap = new PluginMap();
        /**
         * @type {TextLintModuleLoader}
         * @private
         */
        this.moduleLoader = new TextLintModuleLoader(this.config);
        this.moduleLoader.on(TextLintModuleLoader.Event.rule, ([ruleName, ruleCreator]) => {
            this.ruleMap.defineRule(ruleName, ruleCreator);
        });
        this.moduleLoader.on(TextLintModuleLoader.Event.filterRule, ([ruleName, ruleCreator]) => {
            this.filterRuleMap.defineRule(ruleName, ruleCreator);
        });
        this.moduleLoader.on(TextLintModuleLoader.Event.plugin, ([pluginName, plugin]) => {
            this.pluginMap.set(pluginName, plugin);
        });
        // load rule/plugin/processor
        this.moduleLoader.loadFromConfig(this.config);
        // set settings to textlint core
        this._setupRules();
    }

    /**
     * @deprecated remove this method
     */
    setRulesBaseDirectory() {
        throw new Error(`Should not use setRulesBaseDirectory(), insteadof use         
new TextLintEngine({
 rulesBaseDirectory: directory
})
        `);
    }

    /**
     * load plugin manually
     * Note: it high cost, please use config
     * @param {string} pluginName
     * @deprecated use Constructor(config) insteadof it
     */
    loadPlugin(pluginName: string) {
        this.moduleLoader.loadPlugin(pluginName);
        this._setupRules();
    }

    /**
     * load plugin manually
     * Note: it high cost, please use config
     * @param {string} presetName
     * @deprecated use Constructor(config) insteadof it
     */
    loadPreset(presetName: string) {
        this.moduleLoader.loadPreset(presetName);
        this._setupRules();
    }

    /**
     * load rule manually
     * Note: it high cost, please use config
     * @param {string} ruleName
     * @deprecated use Constructor(config) insteadof it
     */
    loadRule(ruleName: string) {
        this.moduleLoader.loadRule(ruleName);
        this._setupRules();
    }

    /**
     * load filter rule manually
     * Note: it high cost, please use config
     * @param {string} ruleName
     * @deprecated use Constructor(config) insteadof it
     */
    loadFilerRule(ruleName: string) {
        this.moduleLoader.loadFilterRule(ruleName);
        this._setupRules();
    }

    /**
     * Update rules from current config
     * @private
     */
    private _setupRules() {
        // set Rules
        const textlintConfig = this.config ? this.config.toJSON() : {};
        this.textlint.setupRules(this.ruleMap.getAllRules(), textlintConfig.rulesConfig);
        this.textlint.setupFilterRules(this.filterRuleMap.getAllRules(), textlintConfig.filterRulesConfig);
        // set Processor
        this.textlint.setupPlugins(this.pluginMap.toJSON(), textlintConfig.pluginsConfig);
        // execute files that are filtered by availableExtensions.
        // TODO: it very hackable way, should be fixed
        // it is depend on textlintCore's state
        this.availableExtensions = this.textlint.pluginCreatorSet.availableExtensions.concat(this.config.extensions);
    }

    /**
     * Remove all registered rule and clear messages.
     * @private
     */
    resetRules() {
        this.textlint.resetRules();
        this.ruleMap.resetRules();
        this.filerRuleMap.resetRules();
    }

    /**
     * Executes the current configuration on an array of file and directory names.
     * @param {String[]}  files An array of file and directory names.
     * @returns {Promise<TextlintResult[]>} The results for all files that were linted.
     */
    executeOnFiles(files: string[]): Promise<LintResult[]> {
        const execFile = this.onFile(this.textlint);
        const patterns = pathsToGlobPatterns(files, {
            extensions: this.availableExtensions
        });
        const targetFiles = findFiles(patterns);
        // Maybe, unAvailableFilePath should be warning.
        // But, The user can use glob pattern like `src/**/*` as arguments.
        // pathsToGlobPatterns not modified that pattern.
        // So, unAvailableFilePath should be ignored silently.
        const { availableFiles, unAvailableFiles } = separateByAvailability(targetFiles, {
            extensions: this.availableExtensions
        });
        debug("Process files", availableFiles);
        debug("Not Process files", unAvailableFiles);
        // FIXME: remove cast
        return this.executeFileBackerManger.process(availableFiles, execFile) as Promise<LintResult[]>;
    }

    /**
     * If want to lint a text, use it.
     * But, if you have a target file, use {@link executeOnFiles} instead of it.
     * @param {string} text linting text content
     * @param {string} ext ext is a type for linting. default: ".txt"
     * @returns {Promise<TextlintResult[]>}
     */
    executeOnText(text: string, ext: string = ".txt"): Promise<LintResult[]> {
        const textlint = this.textlint;
        const execText = this.onText(textlint);
        // filePath or ext
        const actualExt = ext[0] === "." ? ext : path.extname(ext);
        if (actualExt.length === 0) {
            throw new Error("should specify the extension.\nex) .md");
        }
        return execText(text, actualExt).then((result: LintResult) => {
            return [result];
        });
    }

    /**
     * format {@link results} and return output text.
     * @param {TextlintResult[]} results the collection of result
     * @returns {string} formatted output text
     * @example
     *  console.log(formatResults(results));
     */
    formatResults(results: LintResult[]): string {
        // default formatter: "stylish"
        const formatter = this.onFormat({
            formatterName: this.config.formatterName || "stylish",
            color: this.config.color
        });
        return formatter(results);
    }

    /**
     * Checks if the given message is an error message.
     * @param {TextlintMessage} message The message to check.
     * @returns {boolean} Whether or not the message is an error message.
     */
    isErrorMessage(message: TextlintMessage): boolean {
        return message.severity === SeverityLevel.error;
    }

    /**
     * Checks if the given results contain error message.
     * If there is even one error then return true.
     * @param {TextlintResult[]} results Linting result collection
     * @returns {Boolean} Whether or not the results contain error message.
     */
    isErrorResults(results: TextlintResult[]): boolean {
        return results.some(result => {
            return result.messages.some(this.isErrorMessage);
        });
    }

    /**
     * @returns {boolean}
     */
    hasRuleAtLeastOne() {
        return this.ruleMap.hasRuleAtLeastOne();
    }
}
