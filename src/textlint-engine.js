// LICENSE : MIT
'use strict';
const TextLintCore = require('./textlint-core');
const RuleManager = require('./rule/rule-manager');
const Config = require('./config/config');
const createFormatter = require('textlint-formatter');
const tryResolve = require('try-resolve');
const path = require('path');
import assert from "assert";
import { isPluginRuleKey } from "./util/plugin-uil";
import { findFiles } from "./util/find-util";
const debug = require('debug')('textlint:cli-engine');

function isExperiment(config) {
    var formatterName = config.formatterName;
    if (formatterName === "stylish" || formatterName === "pretty-error" || formatterName === "compact") {
        return true;
    }
}
class TextLintEngine {
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
        this.textLint = new TextLintCore(this.config);
        this.ruleManager = new RuleManager();
        this._setupRules(this.config);
    }

    /**
     * set up lint rules using {@lint Config} object.
     * The {@lint Config} object was created with initialized {@link TextLintEngine} (as-known Constructor).
     * @param {Config} config the config is parsed object
     * @private
     */
    _setupRules(config) {
        debug('config %O', config);
        // --ruledir
        if (config.rulePaths) {
            // load in additional rules
            config.rulePaths.forEach(rulesdir => {
                debug('Loading rules from %o', rulesdir);
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
        // --plugin
        if (config.plugins) {
            // load in additional rules from plugin
            config.plugins.forEach(pluginName => {
                let plugin = this.loadPlugin(pluginName);
                // register plugin.Processor
                if (plugin.hasOwnProperty("Processor")) {
                    this.textLint.addProcessor(plugin.Processor);
                }
            });
        }
        const textlintConfig = config ? config.toJSON() : {};
        this.textLint.setupRules(this.ruleManager.getAllRules(), textlintConfig.rulesConfig);
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
     * set directory to use as root directory to load rule.
     * @param {string} directory as root directory to load rule
     * @deprecated please use
     *
     * ```
     * new TextLintEngine({
     *  rulesBaseDirectory: directory
     * })
     * ```
     */
    setRulesBaseDirectory(directory) {
        this.config.rulesBaseDirectory = directory;
        this._setupRules(this.config);
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
        const pluginNameWithoutPrefix = pluginName.replace(prefixMatch, '');
        const baseDir = this.config.rulesBaseDirectory || '';
        const textlintRuleName = `${PLUGIN_NAME_PREFIX}${ pluginName }`;
        const pkgPath = tryResolve(path.join(baseDir, textlintRuleName)) || tryResolve(path.join(baseDir, pluginName));
        if (!pkgPath) {
            throw new ReferenceError(`plugin: ${ pluginName } is not found`);
        }
        debug('Loading rules from plugin: %s', pkgPath);
        const plugin = require(pkgPath.normalize());
        this.ruleManager.importPlugin(plugin.rules, pluginNameWithoutPrefix);
        return plugin;
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
        const definedRuleName = ruleName.replace(prefixMatch, '');
        // ignore plugin's rule
        if (isPluginRuleKey(definedRuleName)) {
            console.warn(`${definedRuleName} is Plugin's rule. This is unknown case, please report issue.`);
            return;
        }
        if (this.ruleManager.isDefinedRule(definedRuleName)) {
            return;
        }
        const baseDir = this.config.rulesBaseDirectory || '';
        const textlintRuleName = `${RULE_NAME_PREFIX}${ ruleName }`;
        const pkgPath = tryResolve(path.join(baseDir, textlintRuleName)) || tryResolve(path.join(baseDir, ruleName));
        if (!pkgPath) {
            throw new ReferenceError(`rule: ${ ruleName } is not found`);
        }
        debug('Loading rules from %s', pkgPath);
        const plugin = require(pkgPath);
        this.ruleManager.defineRule(definedRuleName, plugin);
    }

    /**
     * Remove all registered rule and clear messages.
     */
    resetRules() {
        this.textLint.resetRules();
        this.ruleManager.resetRules();
    }

    /**
     * Executes the current configuration on an array of file and directory names.
     * @param {String[]}  files An array of file and directory names.
     * @returns {TextLintResult[]} The results for all files that were linted.
     */
    executeOnFiles(files) {
        let availableExtensions = this.config.extensions;
        // execute files that are filtered by availableExtensions.
        this.textLint.processors.forEach(processor => {
            let Processor = processor.constructor;
            availableExtensions = availableExtensions.concat(Processor.availableExtensions());
        });
        const targetFiles = findFiles(files, availableExtensions);
        const results = targetFiles.map(file => {
            return this.textLint.lintFile(file);
        });
        // warning message: experimental support
        const fileExtList = targetFiles.map(filePath => {
            return path.extname(filePath);
        });
        if (isExperiment(this.config) && fileExtList.indexOf(".html") !== -1) {
            console.log(`Currently, "HTML" is experimental support.

If you find error and please file issue:
https://github.com/textlint/textlint/issues/new
`);
        }
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
        return this.textLint.lintText(text, ext).then(result => {
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
        const formatter = createFormatter({formatterName: this.config.formatterName});
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
}

module.exports = TextLintEngine;
