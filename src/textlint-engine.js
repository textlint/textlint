// LICENSE : MIT
"use strict";
const Promise = require("bluebird");
const createFormatter = require("textlint-formatter");
const path = require("path");
import TextLintCore from "./textlint-core";
import RuleSet from "./engine/rule-set";
import Config from "./config/config";
import {findFiles} from "./util/find-util";
import TextLintModuleLoader from "./engine/textlint-module-loader";
export default class TextLintEngine {
    /**
     * Process files are wanted to lint.
     * TextLintEngine is a wrapper of textlint.js.
     * Aim to be called from cli with cli options.
     * @param {TextLintConfig} options the options is command line options or Config object.
     * @constructor
     */
    constructor(options) {
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
        this.textLint = new TextLintCore(this.config);

        // dirty flag
        this._isChangedLoadingRules = false;
        /**
         * @type {RuleSet} ruleSet is used for linting/fixiing
         */
        this.ruleSet = new RuleSet();
        this.moduleLoader = new TextLintModuleLoader(this.config);
        this.moduleLoader.on(TextLintModuleLoader.Event.rule, ([ruleName, ruleCreator]) => {
            this._isChangedLoadingRules = true;
            this.ruleSet.defineRule(ruleName, ruleCreator);
        });
        this.moduleLoader.on(TextLintModuleLoader.Event.processor, (Processor) => {
            this.textLint.addProcessor(Processor);
        });
        // load rule/plugin/processor
        this.moduleLoader.loadFromConfig(this.config);
        // execute files that are filtered by availableExtensions.
        this.availableExtensions = this.textLint.processors.reduce((availableExtensions, processor) => {
            const Processor = processor.constructor;
            return availableExtensions.concat(Processor.availableExtensions());
        }, this.config.extensions);

        // reset
        const textlintConfig = this.config ? this.config.toJSON() : {};
        this.textLint.setupRules(this.ruleSet.getAllRules(), textlintConfig.rulesConfig);
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

    loadPlugin(pluginName) {
        this.moduleLoader.loadPlugin(pluginName);
        return this.ruleSet;
    }

    loadPreset(presetName) {
        this.moduleLoader.loadPreset(presetName);
        return this.ruleSet;
    }

    loadRule(ruleName) {
        this.moduleLoader.loadRule(ruleName);
        return this.ruleSet;
    }

    /**
     * Remove all registered rule and clear messages.
     */
    resetRules() {
        this.textLint.resetRules();
        this.ruleSet.resetRules();
    }

    /**
     * Executes the current configuration on an array of file and directory names.
     * @param {String[]}  files An array of file and directory names.
     * @returns {TextLintResult[]} The results for all files that were linted.
     */
    executeOnFiles(files) {
        // reset
        const textlintConfig = this.config ? this.config.toJSON() : {};
        this.textLint.setupRules(this.ruleSet.getAllRules(), textlintConfig.rulesConfig);

        const targetFiles = findFiles(files, this.availableExtensions);
        const results = targetFiles.map(file => {
            return this.textLint.lintFile(file);
        });
        return Promise.all(results);
    }

    /**
     * If want to lint a text, use it.
     * But, if you have a target file, use {@link executeOnFiles} instead of it.
     * @param {string} text linting text content
     * @param {string} ext ext is a type for linting. default: ".txt"
     * @returns {TextLintResult[]}
     */
    executeOnText(text, ext = ".txt") {
        // reset
        const textlintConfig = this.config ? this.config.toJSON() : {};
        this.textLint.setupRules(this.ruleSet.getAllRules(), textlintConfig.rulesConfig);

        // filepath or ext
        const actualExt = ext[0] === "." ? ext : path.extname(ext);
        if (actualExt.length === 0) {
            throw new Error("should specify the extension.\nex) .md");
        }
        return this.textLint.lintText(text, actualExt).then(result => {
            return [result];
        });
    }

    /**
     * Fixes the current configuration on an array of file and directory names.
     * @param {String[]}  files An array of file and directory names.
     * @returns {TextLintFixResult[]} The results for all files that were linted.
     */
    fixFiles(files) {
        const targetFiles = findFiles(files, this.availableExtensions);
        const results = targetFiles.map(file => {
            return this.textLint.fixFile(file);
        });
        return Promise.all(results);
    }

    /**
     * Fix texts with ext option.
     *
     * @param {string} text linting text content
     * @param {string} ext ext is a type for linting. default: ".txt"
     * @returns {TextLintFixResult[]}
     */
    fixText(text, ext = ".txt") {
        // filepath or ext
        const actualExt = ext[0] === "." ? ext : path.extname(ext);
        if (actualExt.length === 0) {
            throw new Error("should specify the extension.\nex) .md");
        }
        return this.textLint.fixText(text, actualExt).then(result => {
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
        const formatter = createFormatter(formatterConfig);
        return formatter(results);
    }

    /**
     * Checks if the given message is an error message.
     * @param {TextLintMessage} message The message to check.
     * @returns {boolean} Whether or not the message is an error message.
     */
    isErrorMessage(message) {
        return message.severity === 2;
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

    hasRuleAtLeastOne() {
        return this.ruleSet.hasRuleAtLeastOne();
    }
}
