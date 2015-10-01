// LICENSE : MIT
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var textLint = require('./textlint');
var fileTraverse = require('./util/traverse');
var Config = require('./config/config');
var createFormatter = require('textlint-formatter');
var tryResolve = require('try-resolve');
var path = require('path');
var ruleManager = require('./rule/rule-manager');
var debug = require('debug')('text:cli-engine');

var TextLintEngine = (function () {
    /**
     * Process files are wanted to lint.
     * TextLintEngine is a wrapper of textlint.js.
     * Aim to be called from cli with cli options.
     * @param {TextLintConfig|} options the options is command line options or Config object.
     * @constructor
     */

    function TextLintEngine(options) {
        _classCallCheck(this, TextLintEngine);

        if (options instanceof Config) {
            // Almost internal use-case
            this.config = options;
        } else {
            this.config = new Config(options);
        }
    }

    /**
     * filter files by config
     * @param files
     * @param {Config} config
     */

    /**
     * set up lint rules using {@lint Config} object.
     * The {@lint Config} object was created with initialized {@link TextLintEngine} (as-known Constructor).
     * @param {Config} config the config is parsed object
     */

    _createClass(TextLintEngine, [{
        key: 'setupRules',
        value: function setupRules() {
            var config = arguments.length <= 0 || arguments[0] === undefined ? this.config : arguments[0];

            debug('config %O', config);
            var that = this;
            // --ruledir
            if (config.rulePaths) {
                // load in additional rules
                config.rulePaths.forEach(function (rulesdir) {
                    debug('Loading rules from %o', rulesdir);
                    ruleManager.loadRules(rulesdir);
                });
            }
            // --rule
            if (config.rules) {
                // load in additional rules
                config.rules.forEach(function (ruleName) {
                    that.loadRule(ruleName);
                });
            }
            var textlintConfig = config ? config.toJSON() : {};
            textLint.setupRules(ruleManager.getAllRules(), textlintConfig.rulesConfig, textlintConfig);
        }

        /**
         * add rule to config.rules
         * if rule already exists, then not added
         * @param {string} ruleName
         */
    }, {
        key: 'addRule',
        value: function addRule(ruleName) {
            if (Array.isArray(this.config.rules) && this.config.rules.indexOf(ruleName) === -1) {
                this.config.rules.push(ruleName);
            }
        }

        /**
         * set directory to use as root directory to load rule.
         * @param {string} directory as root directory to load rule
         */
    }, {
        key: 'setRulesBaseDirectory',
        value: function setRulesBaseDirectory(directory) {
            this.config.rulesBaseDirectory = directory;
        }

        /**
         * load rule file with `ruleName` and define rule.
         * if rule is not found, then throw ReferenceError.
         * if already rule is loaded, do not anything.
         * @param {string} ruleName
         */
    }, {
        key: 'loadRule',
        value: function loadRule(ruleName) {
            // ignore already defined rule
            // ignore rules from rulePaths because avoid ReferenceError is that try to require.
            if (ruleManager.isDefinedRule(ruleName)) {
                return;
            }
            var directory = this.config.rulesBaseDirectory || '';
            var pkgPath = tryResolve(path.join(directory, 'textlint-rule-' + ruleName)) || tryResolve(path.join(directory, ruleName));
            if (!pkgPath) {
                throw new ReferenceError(ruleName + ' is not found');
            }
            debug('Loading rules from %s', pkgPath);
            var plugin = require(pkgPath);
            var definedRuleName = ruleName.replace(/^textlint\-rule\-/, '');
            ruleManager.defineRule(definedRuleName, plugin);
        }

        /**
         * Remove all registered rule and clear messages.
         */
    }, {
        key: 'resetRules',
        value: function resetRules() {
            textLint.resetRules();
        }

        /**
         * Executes the current configuration on an array of file and directory names.
         * @param {String[]}  files An array of file and directory names.
         * @returns {TextLintResult[]} The results for all files that were linted.
         */
    }, {
        key: 'executeOnFiles',
        value: function executeOnFiles(files) {
            this.setupRules(this.config);
            var targetFiles = findFiles(files, this.config);
            var results = targetFiles.map(function (file) {
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
    }, {
        key: 'executeOnText',
        value: function executeOnText(text) {
            this.setupRules(this.config);
            var results = [textLint.lintText(text)];
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
    }, {
        key: 'formatResults',
        value: function formatResults(results) {
            var formatter = createFormatter({ formatterName: this.config.formatterName });
            return formatter(results);
        }

        /**
         * Checks if the given message is an error message.
         * @param {TextLintMessage} message The message to check.
         * @returns {boolean} Whether or not the message is an error message.
         */
    }, {
        key: 'isErrorMessage',
        value: function isErrorMessage(message) {
            return message.severity === 2;
        }

        /**
         * Checks if the given results contain error message.
         * If there is even one error then return true.
         * @param {TextLintResult[]} results Linting result collection
         * @returns {Boolean} Whether or not the results contain error message.
         */
    }, {
        key: 'isErrorResults',
        value: function isErrorResults(results) {
            var that = this;
            return results.some(function (result) {
                return result.messages.some(that.isErrorMessage);
            });
        }
    }]);

    return TextLintEngine;
})();

function findFiles(files, config) {
    var processed = [];
    // sync
    fileTraverse({
        files: files,
        extensions: config.extensions,
        exclude: false
    }, function (filename) {
        debug('Processing ' + filename);
        processed.push(filename);
    });
    return processed;
}
module.exports = TextLintEngine;
//# sourceMappingURL=textlint-engine.js.map