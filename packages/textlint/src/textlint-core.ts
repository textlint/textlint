// LICENSE : MIT
"use strict";
/*
 textlint-core.js is a class
 textlint.js is a singleton object that is instance of textlint-core.js.
 */
import { TextlintrcDescriptor } from "./textlintrc-descriptor/TextlintrcDescriptor";
import {
    TextlintFixResult,
    TextlintKernel,
    TextlintPluginCreator,
    TextlintPluginProcessorConstructor,
    TextlintResult
} from "@textlint/kernel";
import { readFile } from "./util/fs-promise";
import { Config } from "./config/config";

const path = require("path");
const ObjectAssign = require("object-assign");

const { throwIfTesting } = require("@textlint/feature-flag");

const markdownPlugin = require("@textlint/textlint-plugin-markdown");
const textPlugin = require("@textlint/textlint-plugin-text");

/**
 * @class {TextLintCore}
 */
export class TextLintCore {
    kernel: TextlintKernel;
    config: Partial<Config>;
    defaultPlugins: {
        markdown: TextlintPluginCreator;
        text: TextlintPluginCreator;
    };
    public textlintrcDescriptor: TextlintrcDescriptor;

    constructor(config: Partial<Config> = {}) {
        // this.config often is undefined.
        this.config = config;
        // Markdown and Text is enabled by default
        // Markdown and Text are for backward compatibility.
        this.defaultPlugins = {
            markdown: markdownPlugin,
            text: textPlugin
        };
        // TODO: remove `config`
        // https://github.com/textlint/textlint/issues/296
        this.kernel = new TextlintKernel(config);
        this.textlintrcDescriptor = new TextlintrcDescriptor({
            rules: {},
            rulesOption: {},
            plugins: this.defaultPlugins,
            pluginsOption: {},
            filterRules: {},
            filterRulesOption: {}
        });
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
     * It will be removed until textlint@10
     */
    addProcessor(Processor: TextlintPluginProcessorConstructor) {
        throwIfTesting(
            "Use setupPlugins insteadof addProcessor method.`addProcessor` will be removed in the future." +
                "For more details, See https://github.com/textlint/textlint/issues/293"
        );
        this.textlintrcDescriptor = this.textlintrcDescriptor.merge({
            plugins: {
                ...this.defaultPlugins,
                [`${Processor.name}@deprecated`]: {
                    Processor
                }
            }
        });
    }

    /**
     * register Processors
     * @param {Object} plugins
     * @param {Object} [pluginsConfig]
     */
    setupPlugins(plugins = {}, pluginsConfig = {}) {
        this.textlintrcDescriptor = this.textlintrcDescriptor.merge({
            plugins: {
                ...this.defaultPlugins,
                ...plugins
            },
            pluginsOption: pluginsConfig
        });
    }

    /**
     * Register rules and rulesConfig.
     * if want to release rules, please call {@link resetRules}.
     * @param {object} rules rule objects array
     * @param {object} [rulesOption] ruleConfig is object
     */
    setupRules(rules = {}, rulesOption = {}) {
        this.textlintrcDescriptor = this.textlintrcDescriptor.merge({
            rules: rules,
            rulesOption: rulesOption
        });
    }

    /**
     * Register filterRules and filterRulesConfig.
     * if want to release rules, please call {@link resetRules}.
     * @param {object} filterRules rule objects array
     * @param {object} [filterRulesOption] ruleConfig is object
     */
    setupFilterRules(filterRules = {}, filterRulesOption = {}) {
        this.textlintrcDescriptor = this.textlintrcDescriptor.merge({
            filterRules: filterRules,
            filterRulesOption: filterRulesOption
        });
    }

    /**
     * Remove all registered rule and clear messages.
     */
    resetRules() {
        this.textlintrcDescriptor = new TextlintrcDescriptor({
            rules: {},
            rulesOption: {},
            plugins: this.defaultPlugins,
            pluginsOption: {},
            filterRules: {},
            filterRulesOption: {}
        });
    }

    /**
     * lint text by registered rules.
     * The result contains target filePath and error messages.
     * @param {string} text
     * @param {string} ext ext is extension. default: .txt
     * @returns {Promise.<TextlintResult>}
     */
    lintText(text: string, ext: string = ".txt"): Promise<TextlintResult> {
        const options = this._mergeSetupOptions({
            ext
        });
        return this.kernel.lintText(text, options);
    }

    /**
     * lint markdown text by registered rules.
     * The result contains target filePath and error messages.
     * @param {string} text markdown format text
     * @returns {Promise.<TextlintResult>}
     */
    lintMarkdown(text: string): Promise<TextlintResult> {
        const ext = ".md";
        const options = this._mergeSetupOptions({
            ext
        });
        return this.kernel.lintText(text, options);
    }

    /**
     * lint file and return result object
     * @param {string} filePath
     * @returns {Promise.<TextlintResult>} result
     */
    lintFile(filePath: string): Promise<TextlintResult> {
        const absoluteFilePath = path.resolve(process.cwd(), filePath);
        const ext = path.extname(absoluteFilePath);
        const options = this._mergeSetupOptions({
            ext,
            filePath: absoluteFilePath
        });
        return readFile(absoluteFilePath).then((text: string) => {
            return this.kernel.lintText(text, options);
        });
    }

    /**
     * fix file and return fix result object
     * @param {string} filePath
     * @returns {Promise.<TextlintFixResult>}
     */
    fixFile(filePath: string): Promise<TextlintFixResult> {
        const absoluteFilePath = path.resolve(process.cwd(), filePath);
        const ext = path.extname(absoluteFilePath);
        const options = this._mergeSetupOptions({
            ext,
            filePath: absoluteFilePath
        });
        return readFile(absoluteFilePath).then((text: string) => {
            return this.kernel.fixText(text, options);
        });
    }

    /**
     * fix texts and return fix result object
     * @param {string} text
     * @param {string} ext
     * @returns {Promise.<TextlintFixResult>}
     */
    fixText(text: string, ext: string = ".txt"): Promise<TextlintFixResult> {
        const options = this._mergeSetupOptions({
            ext
        });
        return this.kernel.fixText(text, options);
    }

    /**
     * @private
     */
    _mergeSetupOptions(options: { ext: string } | { ext: any; filePath: any }) {
        const configFileBaseDir =
            typeof this.config.configFile === "string" ? path.dirname(this.config.configFile) : undefined;
        return ObjectAssign({}, options, {
            configBaseDir: configFileBaseDir,
            plugins: this.textlintrcDescriptor.plugin.toKernelPluginsFormat(),
            rules: this.textlintrcDescriptor.rule.toKernelRulesFormat(),
            filterRules: this.textlintrcDescriptor.filterRule.toKernelRulesFormat()
        });
    }
}
