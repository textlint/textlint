// LICENSE : MIT
"use strict";
/*
 textlint-core.js is a class
 textlint.js is a singleton object that is instance of textlint-core.js.
 */
const path = require("path");
const ObjectAssign = require("object-assign");
import { TextlintKernel } from "@textlint/kernel";
import { readFile } from "./util/fs-promise";
import markdownPlugin from "textlint-plugin-markdown";
import textPlugin from "textlint-plugin-text";
import RuleCreatorSet from "./core/rule-creator-set";
import PluginCreatorSet from "./core/plugin-creator-set";

/**
 * @class {TextlintCore}
 */
export default class TextlintCore {
    constructor(config = {}) {
        // this.config often is undefined.
        this.config = config;
        // Markdown and Text is enabled by default
        // Markdown and Text are for backward compatibility.
        this.defaultPlugins = {
            markdown: markdownPlugin,
            text: textPlugin
        };
        // TODO: remove `config`
        this.kernel = new TextlintKernel(config);
        this.pluginCreatorSet = new PluginCreatorSet(this.defaultPlugins);
        this.ruleCreatorSet = new RuleCreatorSet();
        this.filterRuleCreatorSet = new RuleCreatorSet();
    }

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
     * It will be removed
     */
    addProcessor(Processor) {
        this.pluginCreatorSet = new PluginCreatorSet(ObjectAssign({}, this.defaultPlugins, {
            [`${Processor.name}@deprecated`]: {
                Processor
            }
        }));
    }

    /**
     * register Processors
     * @param {Object} plugins
     */
    setupPlugins(plugins = {}) {
        this.pluginCreatorSet = new PluginCreatorSet(ObjectAssign({}, this.defaultPlugins, plugins));
    }


    /**
     * Register rules and rulesConfig.
     * if want to release rules, please call {@link resetRules}.
     * @param {object} rules rule objects array
     * @param {object} [rulesConfig] ruleConfig is object
     */
    setupRules(rules = {}, rulesConfig = {}) {
        this.ruleCreatorSet = new RuleCreatorSet(rules, rulesConfig);
    }

    /**
     * Register filterRules and filterRulesConfig.
     * if want to release rules, please call {@link resetRules}.
     * @param {object} rules rule objects array
     * @param {object} [rulesConfig] ruleConfig is object
     */
    setupFilterRules(rules = {}, rulesConfig = {}) {
        this.filterRuleCreatorSet = new RuleCreatorSet(rules, rulesConfig);
    }

    /**
     * Remove all registered rule and clear messages.
     */
    resetRules() {
        this.pluginCreatorSet = new PluginCreatorSet(this.defaultPlugins);
        this.ruleCreatorSet = new RuleCreatorSet();
        this.filterRuleCreatorSet = new RuleCreatorSet();
    }

    /**
     * lint text by registered rules.
     * The result contains target filePath and error messages.
     * @param {string} text
     * @param {string} ext ext is extension. default: .txt
     * @returns {Promise.<TextLintResult>}
     */
    lintText(text, ext = ".txt") {
        const options = this._mergeSetupOptions({
            ext
        });
        return this.kernel.lintText(text, options);
    }

    /**
     * lint markdown text by registered rules.
     * The result contains target filePath and error messages.
     * @param {string} text markdown format text
     * @returns {Promise.<TextLintResult>}
     */
    lintMarkdown(text) {
        const ext = ".md";
        const options = this._mergeSetupOptions({
            ext
        });
        return this.kernel.lintText(text, options);
    }

    /**
     * lint file and return result object
     * @param {string} filePath
     * @returns {Promise.<TextLintResult>} result
     */
    lintFile(filePath) {
        const absoluteFilePath = path.resolve(process.cwd(), filePath);
        const ext = path.extname(absoluteFilePath);
        const options = this._mergeSetupOptions({
            ext,
            filePath: absoluteFilePath
        });
        return readFile(absoluteFilePath).then(text => {
            return this.kernel.lintText(text, options);
        });
    }

    /**
     * fix file and return fix result object
     * @param {string} filePath
     * @returns {Promise.<TextLintFixResult>}
     */
    fixFile(filePath) {
        const absoluteFilePath = path.resolve(process.cwd(), filePath);
        const ext = path.extname(absoluteFilePath);
        const options = this._mergeSetupOptions({
            ext,
            filePath: absoluteFilePath
        });
        return readFile(absoluteFilePath).then(text => {
            return this.kernel.fixText(text, options);
        });
    }

    /**
     * fix texts and return fix result object
     * @param {string} text
     * @param {string} ext
     * @returns {Promise.<TextLintFixResult>}
     */
    fixText(text, ext = ".txt") {
        const options = this._mergeSetupOptions({
            ext
        });
        return this.kernel.fixText(text, options);
    }

    /**
     * @private
     */
    _mergeSetupOptions(options) {
        const configFileBaseDir = this.config.configFile ? path.dirname(this.config.configFile) : undefined;
        return ObjectAssign({}, options, {
            configBaseDir: configFileBaseDir,
            plugins: this.pluginCreatorSet.toKernelPluginsFormat(),
            rules: this.ruleCreatorSet.toKernelRulesFormat(),
            filterRules: this.filterRuleCreatorSet.toKernelRulesFormat(),
        });
    }
}
