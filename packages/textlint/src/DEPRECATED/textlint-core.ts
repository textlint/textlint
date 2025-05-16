// LICENSE : MIT
"use strict";
/*
 textlint-core.js is a class
 textlint.js is a singleton object that is instance of textlint-core.js.
 */
import {
    TextlintKernelDescriptor,
    TextlintFixResult,
    TextlintKernel,
    TextlintKernelPlugin,
    TextlintPluginCreator,
    TextlintPluginOptions,
    TextlintPluginProcessorConstructor,
    TextlintResult
} from "@textlint/kernel";
import fs from "fs";
import { Config } from "./config";
import {
    filterRulesObjectToKernelRule,
    pluginsObjectToKernelRule,
    rulesObjectToKernelRule
} from "../util/object-to-kernel-format";
import textPlugin from "@textlint/textlint-plugin-text";
import markdownPlugin from "@textlint/textlint-plugin-markdown";
import type { TextlintKernelOptions } from "@textlint/kernel";
import path from "path";

const readFile = fs.promises.readFile;
import { throwIfTesting } from "@textlint/feature-flag";
import { Logger } from "../util/logger";

/**
 * @class {TextLintCore}
 * @deprecated use new APIs https://textlint.org/docs/use-as-modules.html#new-apis
 */
export class TextLintCore {
    private kernel: TextlintKernel;
    private config: Partial<Config>;
    private defaultPlugins: TextlintKernelPlugin[];
    public textlintKernelDescriptor: TextlintKernelDescriptor;

    // TODO: can not show deprecated message on constructor
    // because, constructor is called in `textlint` singleton object.
    constructor(config: Partial<Config> = {}) {
        // this.config often is undefined.
        this.config = config;
        // Markdown and Text is enabled by default
        // Markdown and Text are for backward compatibility.
        this.defaultPlugins = [
            {
                pluginId: "markdown",
                plugin: markdownPlugin
            },
            {
                pluginId: "text",
                plugin: textPlugin
            }
        ];
        // TODO: remove `config`
        // https://github.com/textlint/textlint/issues/296
        this.kernel = new TextlintKernel(config);
        this.textlintKernelDescriptor = new TextlintKernelDescriptor({
            rules: [],
            plugins: this.defaultPlugins,
            filterRules: []
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
        this.textlintKernelDescriptor = this.textlintKernelDescriptor.shallowMerge({
            plugins: [
                {
                    pluginId: `${Processor.name}@deprecated`,
                    plugin: { Processor }
                }
            ].concat(this.defaultPlugins)
        });
    }

    /**
     * register Processors
     * @param {Object} plugins
     * @param {Object} [pluginsConfig]
     */
    setupPlugins(
        plugins: { [index: string]: TextlintPluginCreator } = {},
        pluginsConfig: { [index: string]: TextlintPluginOptions } = {}
    ) {
        // Append default plugin to the plugins list.
        // Because, default plugin can be override by user plugins
        this.textlintKernelDescriptor = this.textlintKernelDescriptor.shallowMerge({
            plugins: pluginsObjectToKernelRule(plugins, pluginsConfig).concat(this.defaultPlugins)
        });
    }

    /**
     * Register rules and rulesConfig.
     * if want to release rules, please call {@link resetRules}.
     * @param {object} rules rule objects array
     * @param {object} [rulesOption] ruleConfig is object
     */
    setupRules(rules = {}, rulesOption = {}) {
        Logger.deprecate(
            "TextLintCore is deprecated. Please use new APIs https://github.com/textlint/textlint/issues/1310"
        );
        this.textlintKernelDescriptor = this.textlintKernelDescriptor.shallowMerge({
            rules: rulesObjectToKernelRule(rules, rulesOption)
        });
    }

    /**
     * Register filterRules and filterRulesConfig.
     * if want to release rules, please call {@link resetRules}.
     * @param {object} filterRules rule objects array
     * @param {object} [filterRulesOption] ruleConfig is object
     */
    setupFilterRules(filterRules = {}, filterRulesOption = {}) {
        this.textlintKernelDescriptor = this.textlintKernelDescriptor.shallowMerge({
            filterRules: filterRulesObjectToKernelRule(filterRules, filterRulesOption)
        });
    }

    /**
     * Remove all registered rule and clear messages.
     */
    resetRules() {
        this.textlintKernelDescriptor = new TextlintKernelDescriptor({
            rules: [],
            plugins: this.defaultPlugins,
            filterRules: []
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
        const ext = path.extname(absoluteFilePath) || path.basename(absoluteFilePath);
        const options = this._mergeSetupOptions({
            ext,
            filePath: absoluteFilePath
        });
        return readFile(absoluteFilePath, { encoding: "utf-8" }).then((text: string) => {
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
        const ext = path.extname(absoluteFilePath) || path.basename(absoluteFilePath);
        const options = this._mergeSetupOptions({
            ext,
            filePath: absoluteFilePath
        });
        return readFile(absoluteFilePath, { encoding: "utf-8" }).then((text: string) => {
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
    private _mergeSetupOptions(options: { ext: string } | { ext: any; filePath: any }): TextlintKernelOptions {
        const configFileBaseDir =
            typeof this.config.configFile === "string" ? path.dirname(this.config.configFile) : undefined;
        return {
            ...options,
            configBaseDir: configFileBaseDir,
            plugins: this.textlintKernelDescriptor.plugin.toKernelPluginsFormat(),
            rules: this.textlintKernelDescriptor.rule.toKernelRulesFormat(),
            filterRules: this.textlintKernelDescriptor.filterRule.toKernelFilterRulesFormat()
        };
    }
}
