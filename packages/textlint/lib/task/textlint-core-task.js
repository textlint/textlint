// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ruleError;

function _load_ruleError() {
    return _ruleError = _interopRequireDefault(require("../core/rule-error"));
}

var _sourceLocation;

function _load_sourceLocation() {
    return _sourceLocation = _interopRequireDefault(require("../core/source-location"));
}

var _timing;

function _load_timing() {
    return _timing = _interopRequireDefault(require("./../util/timing"));
}

var _MessageType;

function _load_MessageType() {
    return _MessageType = _interopRequireDefault(require("../shared/type/MessageType"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require("events");
var TraverseController = require("txt-ast-traverse").Controller;
var PromiseEventEmitter = require("carrack");
var traverseController = new TraverseController();
var debug = require("debug")("textlint:core-task");
var assert = require("assert");

// Promised EventEmitter
var RuleTypeEmitter = function (_PromiseEventEmitter) {
    _inherits(RuleTypeEmitter, _PromiseEventEmitter);

    function RuleTypeEmitter() {
        _classCallCheck(this, RuleTypeEmitter);

        var _this = _possibleConstructorReturn(this, (RuleTypeEmitter.__proto__ || Object.getPrototypeOf(RuleTypeEmitter)).call(this));

        _this.setMaxListeners(0);
        return _this;
    }

    return RuleTypeEmitter;
}(PromiseEventEmitter);

/**
 * CoreTask receive AST and prepare, traverse AST, emit nodeType event!
 * You can observe task and receive "message" event that is TextLintMessage.
 */


var TextLintCoreTask = function (_EventEmitter) {
    _inherits(TextLintCoreTask, _EventEmitter);

    _createClass(TextLintCoreTask, null, [{
        key: "events",
        get: function get() {
            return {
                // receive start event
                start: "start",
                // receive message from each rules
                message: "message",
                // receive complete event
                complete: "complete",
                // receive error event
                error: "error"
            };
        }
    }]);

    function TextLintCoreTask() {
        _classCallCheck(this, TextLintCoreTask);

        var _this2 = _possibleConstructorReturn(this, (TextLintCoreTask.__proto__ || Object.getPrototypeOf(TextLintCoreTask)).call(this));

        _this2.ruleTypeEmitter = new RuleTypeEmitter();
        return _this2;
    }

    _createClass(TextLintCoreTask, [{
        key: "createIgnoreReporter",
        value: function createIgnoreReporter() {
            var _this3 = this;

            /**
             * Message of ignoring
             * @typedef {Object} ReportIgnoreMessage
             * @property {string} ruleId
             * @property {number[]} range
             * @property {string} ignoringRuleId to ignore ruleId
             * "*" is special case, it match all ruleId(work as wildcard).
             */
            /**
             * create ReportIgnoreMessage and emit it.
             * @param {ReportIgnoreMessage} reportedMessage
             */
            var reportFunction = function reportFunction(reportedMessage) {
                var ruleId = reportedMessage.ruleId,
                    range = reportedMessage.range,
                    optional = reportedMessage.optional;

                assert(typeof range[0] !== "undefined" && typeof range[1] !== "undefined" && range[0] >= 0 && range[1] >= 0, "ignoreRange should have actual range: " + range);
                var message = {
                    type: (_MessageType || _load_MessageType()).default.ignore,
                    ruleId: ruleId,
                    range: range,
                    // ignoring target ruleId - default: filter all messages
                    ignoringRuleId: optional.ruleId || "*"
                };
                _this3.emit(TextLintCoreTask.events.message, message);
            };
            return reportFunction;
        }
    }, {
        key: "createReporter",
        value: function createReporter(sourceCode) {
            var _this4 = this;

            var sourceLocation = new (_sourceLocation || _load_sourceLocation()).default(sourceCode);

            /**
             * @typedef {Object} ReportMessage
             * @property {string} ruleId
             * @property {TxtNode} node
             * @property {number} severity
             * @property {RuleError} ruleError error is a RuleError instance or any data
             */
            /**
             * push new RuleError to results
             * @param {ReportMessage} reportedMessage
             */
            var reportFunction = function reportFunction(reportedMessage) {
                var ruleId = reportedMessage.ruleId,
                    severity = reportedMessage.severity,
                    ruleError = reportedMessage.ruleError;

                debug("%s pushReport %s", ruleId, ruleError);

                var _sourceLocation$adjus = sourceLocation.adjust(reportedMessage),
                    line = _sourceLocation$adjus.line,
                    column = _sourceLocation$adjus.column,
                    fix = _sourceLocation$adjus.fix;

                var index = sourceCode.positionToIndex({ line: line, column: column });
                // add TextLintMessage
                var message = {
                    type: (_MessageType || _load_MessageType()).default.lint,
                    ruleId: ruleId,
                    message: ruleError.message,
                    index: index,
                    // See https://github.com/textlint/textlint/blob/master/typing/textlint.d.ts
                    line: line, // start with 1(1-based line number)
                    column: column + 1, // start with 1(1-based column number)
                    severity: severity // it's for compatible ESLint formatter
                };
                if (fix) {
                    message.fix = fix;
                }
                if (!(ruleError instanceof (_ruleError || _load_ruleError()).default)) {
                    // `error` is a any data.
                    var data = ruleError;
                    message.data = data;
                }
                _this4.emit(TextLintCoreTask.events.message, message);
            };
            return reportFunction;
        }

        /**
         * start process and emitting events.
         * You can listen message by `task.on("message", message => {})`
         * @param {SourceCode} sourceCode
         */

    }, {
        key: "startTraverser",
        value: function startTraverser(sourceCode) {
            var _this5 = this;

            var promiseQueue = [];
            var listenerCount = typeof this.ruleTypeEmitter.listenerCount !== "undefined" ? this.ruleTypeEmitter.listenerCount.bind(this.ruleTypeEmitter) // Node 4.x >=
            : EventEmitter.listenerCount.bind(EventEmitter, this.ruleTypeEmitter); // Node 0.12
            this.emit(TextLintCoreTask.events.start);
            var ruleTypeEmitter = this.ruleTypeEmitter;
            traverseController.traverse(sourceCode.ast, {
                enter: function enter(node, parent) {
                    var type = node.type;
                    Object.defineProperty(node, "parent", { value: parent });
                    if (listenerCount(type) > 0) {
                        var promise = ruleTypeEmitter.emit(type, node);
                        promiseQueue.push(promise);
                    }
                },
                leave: function leave(node) {
                    var type = node.type + ":exit";
                    if (listenerCount(type) > 0) {
                        var promise = ruleTypeEmitter.emit(type, node);
                        promiseQueue.push(promise);
                    }
                }
            });
            Promise.all(promiseQueue).then(function () {
                _this5.emit(TextLintCoreTask.events.complete);
            }).catch(function (error) {
                _this5.emit(TextLintCoreTask.events.error, error);
            });
        }

        /**
         * try to get rule object
         * @param {Function} ruleCreator
         * @param {RuleContext|FilterRuleContext} ruleContext
         * @param {Object|boolean} ruleConfig
         * @returns {Object}
         * @throws
         */

    }, {
        key: "tryToGetRuleObject",
        value: function tryToGetRuleObject(ruleCreator, ruleContext, ruleConfig) {
            try {
                return ruleCreator(ruleContext, ruleConfig);
            } catch (error) {
                error.message = "Error while loading rule '" + ruleContext.id + "': " + error.message;
                throw error;
            }
        }

        /**
         * add all the node types as listeners of the rule
         * @param {Function} ruleCreator
         * @param {RuleContext|FilterRuleContext} ruleContext
         * @param {Object|boolean} ruleConfig
         * @returns {Object}
         */

    }, {
        key: "tryToAddListenRule",
        value: function tryToAddListenRule(ruleCreator, ruleContext, ruleConfig) {
            var _this6 = this;

            var ruleObject = this.tryToGetRuleObject(ruleCreator, ruleContext, ruleConfig);
            Object.keys(ruleObject).forEach(function (nodeType) {
                _this6.ruleTypeEmitter.on(nodeType, (_timing || _load_timing()).default.enabled ? (_timing || _load_timing()).default.time(ruleContext.id, ruleObject[nodeType]) : ruleObject[nodeType]);
            });
        }
    }]);

    return TextLintCoreTask;
}(EventEmitter);

exports.default = TextLintCoreTask;
//# sourceMappingURL=textlint-core-task.js.map