// LICENSE : MIT
"use strict";
/*
 textlint-core.js is a class
 textlint.js is a singleton object that is instance of textlint-core.js.
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fsPromise;

function _load_fsPromise() {
    return _fsPromise = require("./util/fs-promise");
}

var _sourceCode;

function _load_sourceCode() {
    return _sourceCode = _interopRequireDefault(require("./core/source-code"));
}

var _proccesorHelper;

function _load_proccesorHelper() {
    return _proccesorHelper = require("./util/proccesor-helper");
}

var _textlintPluginMarkdown;

function _load_textlintPluginMarkdown() {
    return _textlintPluginMarkdown = require("textlint-plugin-markdown");
}

var _textlintPluginText;

function _load_textlintPluginText() {
    return _textlintPluginText = require("textlint-plugin-text");
}

var _ruleCreatorSet;

function _load_ruleCreatorSet() {
    return _ruleCreatorSet = _interopRequireDefault(require("./core/rule-creator-set"));
}

var _fixerProcessor;

function _load_fixerProcessor() {
    return _fixerProcessor = _interopRequireDefault(require("./fixer/fixer-processor"));
}

var _linterProcessor;

function _load_linterProcessor() {
    return _linterProcessor = _interopRequireDefault(require("./linter/linter-processor"));
}

var _MessageProcessManager;

function _load_MessageProcessManager() {
    return _MessageProcessManager = _interopRequireDefault(require("./messages/MessageProcessManager"));
}

var _filterIgnoredProcess;

function _load_filterIgnoredProcess() {
    return _filterIgnoredProcess = _interopRequireDefault(require("./messages/filter-ignored-process"));
}

var _filterDuplicatedProcess;

function _load_filterDuplicatedProcess() {
    return _filterDuplicatedProcess = _interopRequireDefault(require("./messages/filter-duplicated-process"));
}

var _sortMessagesProcess;

function _load_sortMessagesProcess() {
    return _sortMessagesProcess = _interopRequireDefault(require("./messages/sort-messages-process"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require("path");
var assert = require("assert");
// = Processors
// sequence

// parallel

// messsage process manager

/**
 * add fileName to trailing of error message
 * @param {string|undefined} fileName
 * @param {string} message
 * @returns {string}
 */
function addingAtFileNameToError(fileName, message) {
    if (!fileName) {
        return message;
    }
    return message + "\nat " + fileName;
}
/**
 * @class {TextlintCore}
 */

var TextlintCore = function () {
    function TextlintCore() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, TextlintCore);

        // this.config often is undefined.
        this.config = config;
        this.ruleCreatorSet = new (_ruleCreatorSet || _load_ruleCreatorSet()).default();
        this.filterRuleCreatorSet = new (_ruleCreatorSet || _load_ruleCreatorSet()).default();
        // Markdown and Text are for backward compatibility.
        // FIXME: in the future, this.processors is empty by default.
        this._defaultProcessors = [new (_textlintPluginMarkdown || _load_textlintPluginMarkdown()).Processor(config), new (_textlintPluginText || _load_textlintPluginText()).Processor(config)];
        this.processors = this._defaultProcessors.slice();
        // Initialize Message Processor
        // Now, It it built-in process only
        this.messageProcessManager = new (_MessageProcessManager || _load_MessageProcessManager()).default();
        // filter `shouldIgnore()` results
        this.messageProcessManager.add((_filterIgnoredProcess || _load_filterIgnoredProcess()).default);
        // filter duplicated messages
        this.messageProcessManager.add((_filterDuplicatedProcess || _load_filterDuplicatedProcess()).default);
        this.messageProcessManager.add((_sortMessagesProcess || _load_sortMessagesProcess()).default);
    }

    /**
     * unstable API
     * @param Processor
     * @private
     */


    _createClass(TextlintCore, [{
        key: "addProcessor",
        value: function addProcessor(Processor) {
            // add first
            this.processors.unshift(new Processor(this.config));
        }

        /**
         * register Processors
         * @param {Object} processors
         */

    }, {
        key: "setupProcessors",
        value: function setupProcessors() {
            var _this = this;

            var processors = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            this.processors.length = 0;
            Object.keys(processors).forEach(function (key) {
                var Processor = processors[key];
                _this.addProcessor(Processor);
            });
            this.processors = this.processors.concat(this._defaultProcessors);
        }

        /**
         * Register rules and rulesConfig.
         * if want to release rules, please call {@link resetRules}.
         * @param {object} rules rule objects array
         * @param {object} [rulesConfig] ruleConfig is object
         */

    }, {
        key: "setupRules",
        value: function setupRules() {
            var rules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var rulesConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            this.ruleCreatorSet = new (_ruleCreatorSet || _load_ruleCreatorSet()).default(rules, rulesConfig);
        }

        /**
         * Register filterRules and filterRulesConfig.
         * if want to release rules, please call {@link resetRules}.
         * @param {object} rules rule objects array
         * @param {object} [rulesConfig] ruleConfig is object
         */

    }, {
        key: "setupFilterRules",
        value: function setupFilterRules() {
            var rules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var rulesConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            this.filterRuleCreatorSet = new (_ruleCreatorSet || _load_ruleCreatorSet()).default(rules, rulesConfig);
        }

        /**
         * Remove all registered rule and clear messages.
         */

    }, {
        key: "resetRules",
        value: function resetRules() {
            this.ruleCreatorSet = new (_ruleCreatorSet || _load_ruleCreatorSet()).default();
            this.filterRuleCreatorSet = new (_ruleCreatorSet || _load_ruleCreatorSet()).default();
        }

        /**
         * process text in parallel for Rules and return {Promise.<TextLintResult>}
         * In other word, parallel flow process.
         * @param processor
         * @param text
         * @param ext
         * @param filePath
         * @returns {Promise.<TextLintResult>}
         * @private
         */

    }, {
        key: "_parallelProcess",
        value: function _parallelProcess(processor, text, ext, filePath) {
            assert(processor, "processor is not found for " + ext);

            var _processor$processor = processor.processor(ext),
                preProcess = _processor$processor.preProcess,
                postProcess = _processor$processor.postProcess;

            assert(typeof preProcess === "function" && typeof postProcess === "function", "processor should implement {preProcess, postProcess}");
            var ast = preProcess(text, filePath);
            var sourceCode = new (_sourceCode || _load_sourceCode()).default({
                text: text,
                ast: ast,
                ext: ext,
                filePath: filePath
            });
            var linterProcessor = new (_linterProcessor || _load_linterProcessor()).default(processor, this.messageProcessManager);
            return linterProcessor.process({
                config: this.config,
                ruleCreatorSet: this.ruleCreatorSet,
                filterRuleCreatorSet: this.filterRuleCreatorSet,
                sourceCode: sourceCode
            }).catch(function (error) {
                error.message = addingAtFileNameToError(filePath, error.message);
                return Promise.reject(error);
            });
        }

        /**
         * lint text by registered rules.
         * The result contains target filePath and error messages.
         * @param {string} text
         * @param {string} ext ext is extension. default: .txt
         * @returns {Promise.<TextLintResult>}
         */

    }, {
        key: "lintText",
        value: function lintText(text) {
            var ext = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ".txt";

            var processor = (0, (_proccesorHelper || _load_proccesorHelper()).getProcessorMatchExtension)(this.processors, ext);
            return this._parallelProcess(processor, text, ext);
        }

        /**
         * lint markdown text by registered rules.
         * The result contains target filePath and error messages.
         * @param {string} text markdown format text
         * @returns {Promise.<TextLintResult>}
         */

    }, {
        key: "lintMarkdown",
        value: function lintMarkdown(text) {
            var ext = ".md";
            return this.lintText(text, ext);
        }

        /**
         * lint file and return result object
         * @param {string} filePath
         * @returns {Promise.<TextLintResult>} result
         */

    }, {
        key: "lintFile",
        value: function lintFile(filePath) {
            var _this2 = this;

            var absoluteFilePath = path.resolve(process.cwd(), filePath);
            var ext = path.extname(absoluteFilePath);
            return (0, (_fsPromise || _load_fsPromise()).readFile)(absoluteFilePath).then(function (text) {
                var processor = (0, (_proccesorHelper || _load_proccesorHelper()).getProcessorMatchExtension)(_this2.processors, ext);
                return _this2._parallelProcess(processor, text, ext, absoluteFilePath);
            });
        }

        /**
         * fix file and return fix result object
         * @param {string} filePath
         * @returns {Promise.<TextLintFixResult>}
         */

    }, {
        key: "fixFile",
        value: function fixFile(filePath) {
            var _this3 = this;

            var absoluteFilePath = path.resolve(process.cwd(), filePath);
            var ext = path.extname(absoluteFilePath);
            return (0, (_fsPromise || _load_fsPromise()).readFile)(absoluteFilePath).then(function (text) {
                var processor = (0, (_proccesorHelper || _load_proccesorHelper()).getProcessorMatchExtension)(_this3.processors, ext);
                return _this3._sequenceProcess(processor, text, ext, absoluteFilePath);
            });
        }

        /**
         * fix texts and return fix result object
         * @param {string} text
         * @param {string} ext
         * @returns {Promise.<TextLintFixResult>}
         */

    }, {
        key: "fixText",
        value: function fixText(text) {
            var ext = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ".txt";

            var processor = (0, (_proccesorHelper || _load_proccesorHelper()).getProcessorMatchExtension)(this.processors, ext);
            return this._sequenceProcess(processor, text, ext);
        }

        /**
         * process text in series for Rules and return {Promise.<TextLintFixResult>}
         * In other word, sequence flow process.
         * @param processor
         * @param text
         * @param ext
         * @param filePath
         * @returns {Promise.<TextLintFixResult>}
         * @private
         */

    }, {
        key: "_sequenceProcess",
        value: function _sequenceProcess(processor, text, ext, filePath) {
            assert(processor, "processor is not found for " + ext);

            var _processor$processor2 = processor.processor(ext),
                preProcess = _processor$processor2.preProcess,
                postProcess = _processor$processor2.postProcess;

            assert(typeof preProcess === "function" && typeof postProcess === "function", "processor should implement {preProcess, postProcess}");
            var ast = preProcess(text, filePath);
            var sourceCode = new (_sourceCode || _load_sourceCode()).default({
                text: text,
                ast: ast,
                ext: ext,
                filePath: filePath
            });
            var fixerProcessor = new (_fixerProcessor || _load_fixerProcessor()).default(processor, this.messageProcessManager);
            return fixerProcessor.process({
                config: this.config,
                ruleCreatorSet: this.ruleCreatorSet,
                filterRuleCreatorSet: this.filterRuleCreatorSet,
                sourceCode: sourceCode
            }).catch(function (error) {
                error.message = addingAtFileNameToError(filePath, error.message);
                return Promise.reject(error);
            });
        }
    }]);

    return TextlintCore;
}();

exports.default = TextlintCore;
//# sourceMappingURL=textlint-core.js.map