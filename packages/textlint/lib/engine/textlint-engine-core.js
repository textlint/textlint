// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _textlintCore;

function _load_textlintCore() {
    return _textlintCore = _interopRequireDefault(require("./../textlint-core"));
}

var _ruleMap;

function _load_ruleMap() {
    return _ruleMap = _interopRequireDefault(require("./rule-map"));
}

var _processorMap;

function _load_processorMap() {
    return _processorMap = _interopRequireDefault(require("./processor-map"));
}

var _config;

function _load_config() {
    return _config = _interopRequireDefault(require("../config/config"));
}

var _findUtil;

function _load_findUtil() {
    return _findUtil = require("../util/find-util");
}

var _textlintModuleLoader;

function _load_textlintModuleLoader() {
    return _textlintModuleLoader = _interopRequireDefault(require("./textlint-module-loader"));
}

var _executeFileBackerManager;

function _load_executeFileBackerManager() {
    return _executeFileBackerManager = _interopRequireDefault(require("./execute-file-backer-manager"));
}

var _cacheBacker;

function _load_cacheBacker() {
    return _cacheBacker = _interopRequireDefault(require("./execute-file-backers/cache-backer"));
}

var _SeverityLevel;

function _load_SeverityLevel() {
    return _SeverityLevel = _interopRequireDefault(require("../shared/type/SeverityLevel"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var createFormatter = require("textlint-formatter");
var path = require("path");

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
var TextLintEngineCore = function () {
    /**
     * Process files are wanted to lint.
     * TextLintEngine is a wrapper of textlint.js.
     * Aim to be called from cli with cli options.
     * @param {Config|Object} [options] the options is command line options or Config object.
     * @param {{ onFile: Function, onText: Function, onFormat:Function }} [executor] executor are injectable function.
     * @constructor
     */
    function TextLintEngineCore(options) {
        var _this = this;

        var executor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, TextLintEngineCore);

        /**
         * @type {Config}
         */
        this.config = null;
        if (options instanceof (_config || _load_config()).default) {
            // Almost internal use-case
            this.config = options;
        } else {
            this.config = (_config || _load_config()).default.initWithAutoLoading(options);
        }

        /**
         * @type {TextLintCore}
         */
        this.textlint = new (_textlintCore || _load_textlintCore()).default(this.config);

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
        this.executeFileBackerManger = new (_executeFileBackerManager || _load_executeFileBackerManager()).default();
        var cacheBaker = new (_cacheBacker || _load_cacheBacker()).default(this.config);
        if (this.config.cache) {
            this.executeFileBackerManger.add(cacheBaker);
        } else {
            cacheBaker.destroyCache();
        }
        /**
         * @type {RuleMap} ruleMap is used for linting/fixer
         * @private
         */
        this.ruleMap = new (_ruleMap || _load_ruleMap()).default();
        /**
         * @type {RuleMap} filerRuleMap is used for filtering
         * @private
         */
        this.filterRuleMap = new (_ruleMap || _load_ruleMap()).default();
        /**
         * @type {ProcessorMap}
         * @private
         */
        this.processorMap = new (_processorMap || _load_processorMap()).default();
        /**
         * @type {TextLintModuleLoader}
         * @private
         */
        this.moduleLoader = new (_textlintModuleLoader || _load_textlintModuleLoader()).default(this.config);
        this.moduleLoader.on((_textlintModuleLoader || _load_textlintModuleLoader()).default.Event.rule, function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                ruleName = _ref2[0],
                ruleCreator = _ref2[1];

            _this.ruleMap.defineRule(ruleName, ruleCreator);
        });
        this.moduleLoader.on((_textlintModuleLoader || _load_textlintModuleLoader()).default.Event.filterRule, function (_ref3) {
            var _ref4 = _slicedToArray(_ref3, 2),
                ruleName = _ref4[0],
                ruleCreator = _ref4[1];

            _this.filterRuleMap.defineRule(ruleName, ruleCreator);
        });
        this.moduleLoader.on((_textlintModuleLoader || _load_textlintModuleLoader()).default.Event.processor, function (_ref5) {
            var _ref6 = _slicedToArray(_ref5, 2),
                pluginName = _ref6[0],
                Processor = _ref6[1];

            _this.processorMap.set(pluginName, Processor);
        });
        // load rule/plugin/processor
        this.moduleLoader.loadFromConfig(this.config);
        // set settings to textlint core
        this._setupRules();
    }

    /**
     * @deprecated remove this method
     */


    _createClass(TextLintEngineCore, [{
        key: "setRulesBaseDirectory",
        value: function setRulesBaseDirectory() {
            throw new Error("Should not use setRulesBaseDirectory(), insteadof use         \nnew TextLintEngine({\n rulesBaseDirectory: directory\n})\n        ");
        }

        /**
         * load plugin manually
         * Note: it high cost, please use config
         * @param {string} pluginName
         * @deprecated use Constructor(config) insteadof it
         */

    }, {
        key: "loadPlugin",
        value: function loadPlugin(pluginName) {
            this.moduleLoader.loadPlugin(pluginName);
            this._setupRules();
        }

        /**
         * load plugin manually
         * Note: it high cost, please use config
         * @param {string} presetName
         * @deprecated use Constructor(config) insteadof it
         */

    }, {
        key: "loadPreset",
        value: function loadPreset(presetName) {
            this.moduleLoader.loadPreset(presetName);
            this._setupRules();
        }

        /**
         * load rule manually
         * Note: it high cost, please use config
         * @param {string} ruleName
         * @deprecated use Constructor(config) insteadof it
         */

    }, {
        key: "loadRule",
        value: function loadRule(ruleName) {
            this.moduleLoader.loadRule(ruleName);
            this._setupRules();
        }

        /**
         * load filter rule manually
         * Note: it high cost, please use config
         * @param {string} ruleName
         * @deprecated use Constructor(config) insteadof it
         */

    }, {
        key: "loadFilerRule",
        value: function loadFilerRule(ruleName) {
            this.moduleLoader.loadFilterRule(ruleName);
            this._setupRules();
        }

        /**
         * Update rules from current config
         * @private
         */

    }, {
        key: "_setupRules",
        value: function _setupRules() {
            // set Rules
            var textlintConfig = this.config ? this.config.toJSON() : {};
            this.textlint.setupRules(this.ruleMap.getAllRules(), textlintConfig.rulesConfig);
            this.textlint.setupFilterRules(this.filterRuleMap.getAllRules(), textlintConfig.filterRulesConfig);
            // set Processor
            this.textlint.setupProcessors(this.processorMap.toJSON());
            // execute files that are filtered by availableExtensions.
            // TODO: it very hackable way, should be fixed
            // it is depend on textlintCore's state
            this.availableExtensions = this.textlint.processors.reduce(function (availableExtensions, processor) {
                var Processor = processor.constructor;
                return availableExtensions.concat(Processor.availableExtensions());
            }, this.config.extensions);
        }

        /**
         * Remove all registered rule and clear messages.
         * @private
         */

    }, {
        key: "resetRules",
        value: function resetRules() {
            this.textlint.resetRules();
            this.ruleMap.resetRules();
            this.filerRuleMap.resetRules();
        }

        /**
         * Executes the current configuration on an array of file and directory names.
         * @param {String[]}  files An array of file and directory names.
         * @returns {Promise<TextLintResult[]>} The results for all files that were linted.
         */

    }, {
        key: "executeOnFiles",
        value: function executeOnFiles(files) {
            var _this2 = this;

            var boundLintFile = function boundLintFile(file) {
                return _this2.textlint.lintFile(file);
            };
            var execFile = typeof this.executor.onFile === "function" ? this.executor.onFile(this.textlint) : boundLintFile;
            var targetFiles = (0, (_findUtil || _load_findUtil()).findFiles)(files, this.availableExtensions);
            return this.executeFileBackerManger.process(targetFiles, execFile);
        }

        /**
         * If want to lint a text, use it.
         * But, if you have a target file, use {@link executeOnFiles} instead of it.
         * @param {string} text linting text content
         * @param {string} ext ext is a type for linting. default: ".txt"
         * @returns {Promise<TextLintResult[]>}
         */

    }, {
        key: "executeOnText",
        value: function executeOnText(text) {
            var _this3 = this;

            var ext = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ".txt";

            var boundLintText = function boundLintText(file, ext) {
                return _this3.textlint.lintText(file, ext);
            };
            var textlint = this.textlint;
            var execText = typeof this.executor.onText === "function" ? this.executor.onText(textlint) : boundLintText;
            // filePath or ext
            var actualExt = ext[0] === "." ? ext : path.extname(ext);
            if (actualExt.length === 0) {
                throw new Error("should specify the extension.\nex) .md");
            }
            return execText(text, actualExt).then(function (result) {
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

    }, {
        key: "formatResults",
        value: function formatResults(results) {
            var formatterConfig = {
                formatterName: this.config.formatterName,
                color: this.config.color
            };
            var formatter = typeof this.executor.onFormat === "function" ? this.executor.onFormat(formatterConfig) : createFormatter(formatterConfig);
            return formatter(results);
        }

        /**
         * Checks if the given message is an error message.
         * @param {TextLintMessage} message The message to check.
         * @returns {boolean} Whether or not the message is an error message.
         */

    }, {
        key: "isErrorMessage",
        value: function isErrorMessage(message) {
            return message.severity === (_SeverityLevel || _load_SeverityLevel()).default.error;
        }

        /**
         * Checks if the given results contain error message.
         * If there is even one error then return true.
         * @param {TextLintResult[]} results Linting result collection
         * @returns {Boolean} Whether or not the results contain error message.
         */

    }, {
        key: "isErrorResults",
        value: function isErrorResults(results) {
            var _this4 = this;

            return results.some(function (result) {
                return result.messages.some(_this4.isErrorMessage);
            });
        }

        /**
         * @returns {boolean}
         */

    }, {
        key: "hasRuleAtLeastOne",
        value: function hasRuleAtLeastOne() {
            return this.ruleMap.hasRuleAtLeastOne();
        }
    }]);

    return TextLintEngineCore;
}();

exports.default = TextLintEngineCore;
//# sourceMappingURL=textlint-engine-core.js.map