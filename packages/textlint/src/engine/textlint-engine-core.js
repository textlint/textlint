// LICENSE : MIT
"use strict";
const createFormatter = require("textlint-formatter");
const path = require("path");
import TextLintCore from "./../textlint-core";
import RuleMap from "./rule-map";
import ProcessorMap from "./processor-map";
import Config from "../config/config";
import {findFiles} from "../util/find-util";
import TextLintModuleLoader from "./textlint-module-loader";
import ExecuteFileBackerManager from "./execute-file-backer-manager";
import CacheBaker from "./execute-file-backers/cache-backer";
import SeverityLevel from "../shared/type/SeverityLevel";
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
export default class TextLintEngineCore {
    /**
     * Process files are wanted to lint.
     * TextLintEngine is a wrapper of textlint.js.
     * Aim to be called from cli with cli options.
     * @param {Config|Object} [options] the options is command line options or Config object.
     * @param {{ onFile: Function, onText: Function, onFormat:Function }} [executor] executor are injectable function.
     * @constructor
     */
    constructor(options, executor = {}) {
        /**
         * @type {Config}
         */
        this.config = null;
        if (options instanceof Config) {
            // Almost internal use-case
            this.config = options;
        } else {
            this.config = Config.initWithAutoLoading(options);
        }

        /**
         * @type {TextLintCore}
         */
        this.textlint = new TextLintCore(this.config);

        /**
         * @type {{
         *  onFile: function(textlint: TextlintCore):Function,
         *  onText: function(textlint: TextlintCore):Function,
         *  onFormat:Function}}
         */
        this.executor = executor;

        /**
         * @type {ExecuteFileBackerManager}
         * @private
         */
        this.executeFileBackerManger = new ExecuteFileBackerManager();
        const cacheBaker = new CacheBaker(this.config);
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
         * @type {ProcessorMap}
         * @private
         */
        this.processorMap = new ProcessorMap();
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
        this.moduleLoader.on(TextLintModuleLoader.Event.processor, ([pluginName, Processor]) => {
            this.processorMap.set(pluginName, Processor);
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
    loadPlugin(pluginName) {
        this.moduleLoader.loadPlugin(pluginName);
        this._setupRules();
    }

    /**
     * load plugin manually
     * Note: it high cost, please use config
     * @param {string} presetName
     * @deprecated use Constructor(config) insteadof it
     */
    loadPreset(presetName) {
        this.moduleLoader.loadPreset(presetName);
        this._setupRules();
    }

    /**
     * load rule manually
     * Note: it high cost, please use config
     * @param {string} ruleName
     * @deprecated use Constructor(config) insteadof it
     */
    loadRule(ruleName) {
        this.moduleLoader.loadRule(ruleName);
        this._setupRules();
    }

    /**
     * load filter rule manually
     * Note: it high cost, please use config
     * @param {string} ruleName
     * @deprecated use Constructor(config) insteadof it
     */
    loadFilerRule(ruleName) {
        this.moduleLoader.loadFilterRule(ruleName);
        this._setupRules();
    }

    /**
     * Update rules from current config
     * @private
     */
    _setupRules() {
        // set Rules
        const textlintConfig = this.config ? this.config.toJSON() : {};
        this.textlint.setupRules(this.ruleMap.getAllRules(), textlintConfig.rulesConfig);
        this.textlint.setupFilterRules(this.filterRuleMap.getAllRules(), textlintConfig.filterRulesConfig);
        // set Processor
        this.textlint.setupProcessors(this.processorMap.toJSON());
        // execute files that are filtered by availableExtensions.
        // TODO: it very hackable way, should be fixed
        // it is depend on textlintCore's state
        this.availableExtensions = this.textlint.processors.reduce((availableExtensions, processor) => {
            const Processor = processor.constructor;
            return availableExtensions.concat(Processor.availableExtensions());
        }, this.config.extensions);

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
     * @returns {Promise<TextLintResult[]>} The results for all files that were linted.
     */
    executeOnFiles(files) {
        const boundLintFile = (file) => {
            return this.textlint.lintFile(file);
        };
        const execFile = typeof this.executor.onFile === "function"
            ? this.executor.onFile(this.textlint)
            : boundLintFile;
        const targetFiles = findFiles(files, this.availableExtensions);
        return this.executeFileBackerManger.process(targetFiles, execFile);
    }

    /**
     * If want to lint a text, use it.
     * But, if you have a target file, use {@link executeOnFiles} instead of it.
     * @param {string} text linting text content
     * @param {string} ext ext is a type for linting. default: ".txt"
     * @returns {Promise<TextLintResult[]>}
     */
    executeOnText(text, ext = ".txt") {
        const boundLintText = (file, ext) => {
            return this.textlint.lintText(file, ext);
        };
        const textlint = this.textlint;
        const execText = typeof this.executor.onText === "function"
            ? this.executor.onText(textlint)
            : boundLintText;
        // filePath or ext
        const actualExt = ext[0] === "." ? ext : path.extname(ext);
        if (actualExt.length === 0) {
            throw new Error("should specify the extension.\nex) .md");
        }
        return execText(text, actualExt).then(result => {
            return [result];
        });
    }

    /**
     * format {@link results} and return output text.
     * @param {TextLintResult[]} results the collection of result
     * @returns {string} formatted output text
     * @example
     *  console.log(formatResults(results));
     */
    formatResults(results) {
        const formatterConfig = {
            formatterName: this.config.formatterName,
            color: this.config.color
        };
        const formatter = typeof this.executor.onFormat === "function"
            ? this.executor.onFormat(formatterConfig)
            : createFormatter(formatterConfig);
        return formatter(results);
    }

    /**
     * Checks if the given message is an error message.
     * @param {TextLintMessage} message The message to check.
     * @returns {boolean} Whether or not the message is an error message.
     */
    isErrorMessage(message) {
        return message.severity === SeverityLevel.error;
    }

    /**
     * Checks if the given results contain error message.
     * If there is even one error then return true.
     * @param {TextLintResult[]} results Linting result collection
     * @returns {Boolean} Whether or not the results contain error message.
     */
    isErrorResults(results) {
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
