// LICENSE : MIT
'use strict';
const textLint = require('./textlint');
const fileTraverse = require('./util/traverse');
const Config = require('./config/config');
const createFormatter = require('textlint-formatter');
const tryResolve = require('try-resolve');
const path = require('path');
const ruleManager = require('./rule/rule-manager');
const debug = require('debug')('text:cli-engine');
class TextLintEngine {
    /**
     * Process files are wanted to lint.
     * TextLintEngine is a wrapper of textlint.js.
     * Aim to be called from cli with cli options.
     * @param {TextLintConfig|} options the options is command line options or Config object.
     * @constructor
     */
    constructor(options) {
        if (options instanceof Config) {
            // Almost internal use-case
            this.config = options;
        } else {
            this.config = new Config(options);
        }
    }

    /**
     * set up lint rules using {@lint Config} object.
     * The {@lint Config} object was created with initialized {@link TextLintEngine} (as-known Constructor).
     * @param {Config} config the config is parsed object
     */
    setupRules(config = this.config) {
        debug('config %O', config);
        const that = this;
        // --ruledir
        if (config.rulePaths) {
            // load in additional rules
            config.rulePaths.forEach(rulesdir => {
                debug('Loading rules from %o', rulesdir);
                ruleManager.loadRules(rulesdir);
            });
        }
        // --rule
        if (config.rules) {
            // load in additional rules
            config.rules.forEach(ruleName => {
                that.loadRule(ruleName);
            });
        }
        const textlintConfig = config ? config.toJSON() : {};
        textLint.setupRules(ruleManager.getAllRules(), textlintConfig.rulesConfig, textlintConfig);
    }

    /**
     * add rule to config.rules
     * if rule already exists, then not added
     * @param {string} ruleName
     */
    addRule(ruleName) {
        if (Array.isArray(this.config.rules) && this.config.rules.indexOf(ruleName) === -1) {
            this.config.rules.push(ruleName);
        }
    }

    /**
     * set directory to use as root directory to load rule.
     * @param {string} directory as root directory to load rule
     */
    setRulesBaseDirectory(directory) {
        this.config.rulesBaseDirectory = directory;
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
        if (ruleManager.isDefinedRule(ruleName)) {
            return;
        }
        const directory = this.config.rulesBaseDirectory || '';
        const pkgPath = tryResolve(path.join(directory, `textlint-rule-${ ruleName }`)) || tryResolve(path.join(directory, ruleName));
        if (!pkgPath) {
            throw new ReferenceError(`${ ruleName } is not found`);
        }
        debug('Loading rules from %s', pkgPath);
        const plugin = require(pkgPath);
        const definedRuleName = ruleName.replace(/^textlint\-rule\-/, '');
        ruleManager.defineRule(definedRuleName, plugin);
    }

    /**
     * Remove all registered rule and clear messages.
     */
    resetRules() {
        textLint.resetRules();
    }

    /**
     * Executes the current configuration on an array of file and directory names.
     * @param {String[]}  files An array of file and directory names.
     * @returns {TextLintResult[]} The results for all files that were linted.
     */
    executeOnFiles(files) {
        this.setupRules(this.config);
        const targetFiles = findFiles(files, this.config);
        const results = targetFiles.map(file => {
            return textLint.lintFile(file);
        });
        textLint.resetRules();
        return results;
    }

    /**
     * If want to lint a text, use it.
     * But, if you have a target file, use {@link executeOnFiles} instead of it.
     * @param text plain text for lint
     * @returns {TextLintResult[]}
     * @todo specify the files format for lint by config.filetype?
     */
    executeOnText(text) {
        this.setupRules(this.config);
        const results = [textLint.lintText(text)];
        textLint.resetRules();
        return results;
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
        const that = this;
        return results.some(result => {
            return result.messages.some(that.isErrorMessage);
        });
    }
}
/**
 * filter files by config
 * @param files
 * @param {Config} config
 */
function findFiles(files, config) {
    const processed = [];
    // sync
    fileTraverse({
        files: files,
        extensions: config.extensions,
        exclude: false
    }, filename => {
        debug(`Processing ${ filename }`);
        processed.push(filename);
    });
    return processed;
}
module.exports = TextLintEngine;