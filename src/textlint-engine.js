// LICENSE : MIT
"use strict";
const Promise = require("bluebird");
const interopRequire = require("interop-require");
const createFormatter = require("textlint-formatter");
const path = require("path");
const debug = require("debug")("textlint:cli-engine");
import {isPluginRuleKey} from "./util/config-util";
import TextLintCore from "./textlint-core";
import RuleManager from "./engine/rule-manager";
import RuleSet from "./engine/rule-set";
import Config from "./config/config";
import {findFiles} from "./util/find-util";
import Logger from "./util/logger";
import TextLintModuleResolver from "./engine/textlint-module-resolver";
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
        /**
         * @type {TextLintModuleResolver}
         */
        this.moduleResolver = new TextLintModuleResolver(this.config.constructor, this.config.rulesBaseDirectory);
        this.ruleSet = new RuleSet();
        this.ruleManager = new RuleManager(this.ruleSet);
        // load rule/plugin/processor
        this._setupRules(this.config);
        // execute files that are filtered by availableExtensions.
        this.availableExtensions = this.textLint.processors.reduce((availableExtensions, processor) => {
            const Processor = processor.constructor;
            return availableExtensions.concat(Processor.availableExtensions());
        }, this.config.extensions);
    }

    /**
     * set up lint rules using {@lint Config} object.
     * The {@lint Config} object was created with initialized {@link TextLintEngine} (as-known Constructor).
     * @param {Config} config the config is parsed object
     * @private
     */
    _setupRules(config) {
        debug("config %O", config);
        // --ruledir
        if (config.rulePaths) {
            // load in additional rules
            config.rulePaths.forEach(rulesdir => {
                debug("Loading rules from %o", rulesdir);
                this.ruleManager.loadRules(rulesdir);
            });
        }
        // --rule
        if (config.rules) {
            // load in additional rules
            config.rules.forEach(ruleName => {
                this.loadRule(ruleName);
            });
        }
        // --preset
        if (config.presets) {
            config.presets.forEach(presetName => {
                this.loadPreset(presetName);
            });
        }
        // --plugin
        if (config.plugins) {
            // load in additional rules from plugin
            config.plugins.forEach(pluginName => {
                const plugin = this.loadPlugin(pluginName);
                // register plugin.Processor
                if (plugin.hasOwnProperty("Processor")) {
                    this.textLint.addProcessor(plugin.Processor);
                }
            });
        }
        const textlintConfig = config ? config.toJSON() : {};
        this.textLint.setupRules(this.ruleSet.getAllRules(), textlintConfig.rulesConfig);
    }

    /**
     * add rule to config.rules
     * if rule already exists, then not added
     * @param {string} ruleName
     */
    addRule(ruleName) {
        if (Array.isArray(this.config.rules) && this.config.rules.indexOf(ruleName) === -1) {
            this.config.rules.push(ruleName);
            this._setupRules(this.config);
        }
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
     * load rule from plugin name.
     * plugin module has `rules` object and define rule with plugin prefix.
     * @param {string} pluginName
     */
    loadPlugin(pluginName) {
        // TODO: ignore already loaded plugin
        const PLUGIN_NAME_PREFIX = this.config.constructor.PLUGIN_NAME_PREFIX;
        const prefixMatch = new RegExp("^" + PLUGIN_NAME_PREFIX);
        const pluginNameWithoutPrefix = pluginName.replace(prefixMatch, "");
        const pkgPath = this.moduleResolver.resolvePluginPackageName(pluginName);
        debug("Loading rules from plugin: %s", pkgPath);
        const plugin = interopRequire(pkgPath);
        // Processor plugin doesn't define rules
        if (plugin.hasOwnProperty("rules")) {
            this.ruleManager.importPlugin(plugin.rules, pluginNameWithoutPrefix);
        }
        return plugin;
    }

    loadPreset(presetName) {
        /*
         - ignore already defined rule
         - ignore rules from rulePaths because avoid ReferenceError is that try to require.

         Caution: Rules of preset are defined as following.
             {
                "rules": {
                    "preset-gizmo": {
                        "ruleA": false

                }
            }

        It mean that "ruleA" is defined as "preset-gizmo/ruleA"

         */
        const RULE_NAME_PREFIX = this.config.constructor.RULE_NAME_PREFIX;
        // Strip **rule** prefix
        // textlint-rule-preset-gizmo -> preset-gizmo
        const prefixMatch = new RegExp("^" + RULE_NAME_PREFIX);
        const presetRuleNameWithoutPrefix = presetName.replace(prefixMatch, "");
        // ignore plugin's rule
        if (isPluginRuleKey(presetRuleNameWithoutPrefix)) {
            Logger.warn(`${presetRuleNameWithoutPrefix} is Plugin's rule. This is unknown case, please report issue.`);
            return;
        }
        const pkgPath = this.moduleResolver.resolvePresetPackageName(presetName);
        debug("Loading rules from preset: %s", pkgPath);
        const preset = interopRequire(pkgPath);
        // Processor plugin doesn't define rules
        this.ruleManager.importPlugin(preset.rules, presetRuleNameWithoutPrefix);
        return preset;
    }

    /**
     * load rule file with `ruleName` and define rule.
     * if rule is not found, then throw ReferenceError.
     * if already rule is loaded, do not anything.
     * @param {string} ruleName
     */
    loadRule(ruleName) {
        // ignore already defined rule
        // ignore rules from rulePaths because avoid ReferenceError is that try to require.
        const RULE_NAME_PREFIX = this.config.constructor.RULE_NAME_PREFIX;
        const prefixMatch = new RegExp("^" + RULE_NAME_PREFIX);
        const definedRuleName = ruleName.replace(prefixMatch, "");
        // ignore plugin's rule
        if (isPluginRuleKey(definedRuleName)) {
            Logger.warn(`${definedRuleName} is Plugin's rule. This is unknown case, please report issue.`);
            return;
        }
        if (this.ruleSet.isDefinedRule(definedRuleName)) {
            return;
        }
        const pkgPath = this.moduleResolver.resolveRulePackageName(ruleName);
        debug("Loading rules from %s", pkgPath);
        const ruleCreator = interopRequire(pkgPath);
        this.ruleSet.defineRule(definedRuleName, ruleCreator);
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
