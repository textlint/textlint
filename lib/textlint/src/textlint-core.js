// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 textlint-core.js is a class
 textlint.js is a singleton object that is instance of textlint-core.js.
 */
var path = require("path");
var ObjectAssign = require("object-assign");
var kernel_1 = require("@textlint/kernel");
var fs_promise_1 = require("./util/fs-promise");
var rule_creator_set_1 = require("./core/rule-creator-set");
var plugin_creator_set_1 = require("./core/plugin-creator-set");
var throwIfTesting = require("@textlint/feature-flag").throwIfTesting;
var markdownPlugin = require("textlint-plugin-markdown");
var textPlugin = require("textlint-plugin-text");
/**
 * @class {TextLintCore}
 */
var TextLintCore = /** @class */ (function () {
    function TextLintCore(config) {
        if (config === void 0) { config = {}; }
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
        this.kernel = new kernel_1.TextlintKernel(config);
        this.pluginCreatorSet = new plugin_creator_set_1.PluginCreatorSet(this.defaultPlugins);
        this.ruleCreatorSet = new rule_creator_set_1.RuleCreatorSet();
        this.filterRuleCreatorSet = new rule_creator_set_1.RuleCreatorSet();
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
    TextLintCore.prototype.addProcessor = function (Processor) {
        throwIfTesting("Use setupPlugins insteadof addProcessor method.`addProcessor` will be removed in the future." +
            "For more details, See https://github.com/textlint/textlint/issues/293");
        this.pluginCreatorSet = new plugin_creator_set_1.PluginCreatorSet(ObjectAssign({}, this.defaultPlugins, (_a = {},
            _a[Processor.name + "@deprecated"] = {
                Processor: Processor
            },
            _a)));
        var _a;
    };
    /**
     * register Processors
     * @param {Object} plugins
     * @param {Object} [pluginsConfig]
     */
    TextLintCore.prototype.setupPlugins = function (plugins, pluginsConfig) {
        if (plugins === void 0) { plugins = {}; }
        if (pluginsConfig === void 0) { pluginsConfig = {}; }
        this.pluginCreatorSet = new plugin_creator_set_1.PluginCreatorSet(ObjectAssign({}, this.defaultPlugins, plugins), pluginsConfig);
    };
    /**
     * Register rules and rulesConfig.
     * if want to release rules, please call {@link resetRules}.
     * @param {object} rules rule objects array
     * @param {object} [rulesConfig] ruleConfig is object
     */
    TextLintCore.prototype.setupRules = function (rules, rulesConfig) {
        if (rules === void 0) { rules = {}; }
        if (rulesConfig === void 0) { rulesConfig = {}; }
        this.ruleCreatorSet = new rule_creator_set_1.RuleCreatorSet(rules, rulesConfig);
    };
    /**
     * Register filterRules and filterRulesConfig.
     * if want to release rules, please call {@link resetRules}.
     * @param {object} rules rule objects array
     * @param {object} [rulesConfig] ruleConfig is object
     */
    TextLintCore.prototype.setupFilterRules = function (rules, rulesConfig) {
        if (rules === void 0) { rules = {}; }
        if (rulesConfig === void 0) { rulesConfig = {}; }
        this.filterRuleCreatorSet = new rule_creator_set_1.RuleCreatorSet(rules, rulesConfig);
    };
    /**
     * Remove all registered rule and clear messages.
     */
    TextLintCore.prototype.resetRules = function () {
        this.pluginCreatorSet = new plugin_creator_set_1.PluginCreatorSet(this.defaultPlugins);
        this.ruleCreatorSet = new rule_creator_set_1.RuleCreatorSet();
        this.filterRuleCreatorSet = new rule_creator_set_1.RuleCreatorSet();
    };
    /**
     * lint text by registered rules.
     * The result contains target filePath and error messages.
     * @param {string} text
     * @param {string} ext ext is extension. default: .txt
     * @returns {Promise.<TextlintResult>}
     */
    TextLintCore.prototype.lintText = function (text, ext) {
        if (ext === void 0) { ext = ".txt"; }
        var options = this._mergeSetupOptions({
            ext: ext
        });
        return this.kernel.lintText(text, options);
    };
    /**
     * lint markdown text by registered rules.
     * The result contains target filePath and error messages.
     * @param {string} text markdown format text
     * @returns {Promise.<TextlintResult>}
     */
    TextLintCore.prototype.lintMarkdown = function (text) {
        var ext = ".md";
        var options = this._mergeSetupOptions({
            ext: ext
        });
        return this.kernel.lintText(text, options);
    };
    /**
     * lint file and return result object
     * @param {string} filePath
     * @returns {Promise.<TextlintResult>} result
     */
    TextLintCore.prototype.lintFile = function (filePath) {
        var _this = this;
        var absoluteFilePath = path.resolve(process.cwd(), filePath);
        var ext = path.extname(absoluteFilePath);
        var options = this._mergeSetupOptions({
            ext: ext,
            filePath: absoluteFilePath
        });
        return fs_promise_1.readFile(absoluteFilePath).then(function (text) {
            return _this.kernel.lintText(text, options);
        });
    };
    /**
     * fix file and return fix result object
     * @param {string} filePath
     * @returns {Promise.<TextlintFixResult>}
     */
    TextLintCore.prototype.fixFile = function (filePath) {
        var _this = this;
        var absoluteFilePath = path.resolve(process.cwd(), filePath);
        var ext = path.extname(absoluteFilePath);
        var options = this._mergeSetupOptions({
            ext: ext,
            filePath: absoluteFilePath
        });
        return fs_promise_1.readFile(absoluteFilePath).then(function (text) {
            return _this.kernel.fixText(text, options);
        });
    };
    /**
     * fix texts and return fix result object
     * @param {string} text
     * @param {string} ext
     * @returns {Promise.<TextlintFixResult>}
     */
    TextLintCore.prototype.fixText = function (text, ext) {
        if (ext === void 0) { ext = ".txt"; }
        var options = this._mergeSetupOptions({
            ext: ext
        });
        return this.kernel.fixText(text, options);
    };
    /**
     * @private
     */
    TextLintCore.prototype._mergeSetupOptions = function (options) {
        var configFileBaseDir = typeof this.config.configFile === "string" ? path.dirname(this.config.configFile) : undefined;
        return ObjectAssign({}, options, {
            configBaseDir: configFileBaseDir,
            plugins: this.pluginCreatorSet.toKernelPluginsFormat(),
            rules: this.ruleCreatorSet.toKernelRulesFormat(),
            filterRules: this.filterRuleCreatorSet.toKernelRulesFormat()
        });
    };
    return TextLintCore;
}());
exports.TextLintCore = TextLintCore;
