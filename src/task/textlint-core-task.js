// LICENSE : MIT
"use strict";
const EventEmitter = require("events");
const TraverseController = require("txt-ast-traverse").Controller;
const PromiseEventEmitter = require("carrack");
const traverseController = new TraverseController();
const debug = require("debug")("textlint:core-task");
const assert = require("assert");
import RuleError from "../core/rule-error";
import SourceLocation from "../core/source-location";
import RuleContext from "../core/rule-context";
import timing from "./../util/timing";
import MessageType from "../shared/type/MessageType";
import {throwWithoutExperimental} from "../util/throw-log";
// Promised EventEmitter
class RuleTypeEmitter extends PromiseEventEmitter {
    constructor() {
        super();
        this.setMaxListeners(0);
    }
}
export default class TextLintCoreTask extends EventEmitter {
    static get events() {
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

    constructor({config, ruleCreatorSet, sourceCode}) {
        super();
        this.config = config;
        this.ruleCreatorSet = ruleCreatorSet;
        this.sourceCode = sourceCode;
        this.ruleTypeEmitter = new RuleTypeEmitter();
        this._setupRuleCreatorListener();
    }

    /* eslint-disable */
    /**
     * return ruleObject
     * @param {Function} ruleCreator
     * @param {RuleContext} ruleContext
     * @param {Object|boolean} ruleConfig
     * @returns {Object}
     */
    getRuleObject(ruleCreator, ruleContext, ruleConfig) {
        throw new Error("Not Implement!!");
    }

    /* eslint-enable */

    createIgnoreReporter() {
        /**
         * @typedef {Object} ReportIgnoreMessage
         * @property {string} ruleId
         * @property {TxtNode} node
         */
        /**
         * push new RuleError to results
         * @param {ReportIgnoreMessage} reportedMessage
         */
        const reportFunction = (reportedMessage) => {
            throwWithoutExperimental("shouldIgnore() is experimental feature.\n" +
                "You can use it with `--experimental` flag. It may will be changed in the future.");
            const {ruleId, node} = reportedMessage;
            // add TextLintMessage
            const range = node.range;
            assert(typeof range[0] !== "undefined" && typeof range[1] !== "undefined" && range[0] >= 0 && range[1] >= 0,
                "ignoreRange should have actual range: " + range);
            const message = {
                type: MessageType.ignore,
                ruleId: ruleId,
                ignoreRange: range
            };
            this.emit(TextLintCoreTask.events.message, message);
        };
        return reportFunction;
    }

    createReporter(sourceCode) {
        const sourceLocation = new SourceLocation(sourceCode);

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
        const reportFunction = (reportedMessage) => {
            const {ruleId, severity, ruleError} = reportedMessage;
            debug("%s pushReport %s", ruleId, ruleError);
            const {line, column, fix} = sourceLocation.adjust(reportedMessage);
            const index = sourceCode.positionToIndex({line, column});
            // add TextLintMessage
            const message = {
                type: MessageType.lint,
                ruleId: ruleId,
                message: ruleError.message,
                index,
                // See https://github.com/textlint/textlint/blob/master/typing/textlint.d.ts
                line: line,        // start with 1(1-based line number)
                column: column + 1,// start with 1(1-based column number)
                severity: severity // it's for compatible ESLint formatter
            };
            if (fix) {
                message.fix = fix;
            }
            if (!(ruleError instanceof RuleError)) {
                // `error` is a any data.
                const data = ruleError;
                message.data = data;
            }
            this.emit(TextLintCoreTask.events.message, message);
        };
        return reportFunction;
    }

    /**
     * start process and emitting events.
     * You can listen message by `task.on("message", message => {})`
     */
    start() {
        const promiseQueue = [];
        const listenerCount = (typeof this.ruleTypeEmitter.listenerCount !== "undefined")
            ? this.ruleTypeEmitter.listenerCount.bind(this.ruleTypeEmitter) // Node 4.x >=
            : EventEmitter.listenerCount.bind(EventEmitter, this.ruleTypeEmitter);// Node 0.12

        this.emit(TextLintCoreTask.events.start);

        const ruleTypeEmitter = this.ruleTypeEmitter;
        traverseController.traverse(this.sourceCode.ast, {
            enter(node, parent) {
                const type = node.type;
                Object.defineProperty(node, "parent", {value: parent});
                if (listenerCount(type) > 0) {
                    const promise = ruleTypeEmitter.emit(type, node);
                    promiseQueue.push(promise);
                }
            },
            leave(node) {
                const type = `${node.type}:exit`;
                if (listenerCount(type) > 0) {
                    const promise = ruleTypeEmitter.emit(type, node);
                    promiseQueue.push(promise);
                }
            }
        });
        Promise.all(promiseQueue).then(() => {
            this.emit(TextLintCoreTask.events.complete);
        }).catch(error => {
            this.emit(TextLintCoreTask.events.error, error);
        });
    }

    /**
     * setup ruleTypeEmitter
     * @private
     */
    _setupRuleCreatorListener() {
        const rules = this.ruleCreatorSet.rules;
        const rulesConfig = this.ruleCreatorSet.rulesConfig;
        const textLintConfig = this.config;
        const sourceCode = this.sourceCode;
        const report = this.createReporter(sourceCode);
        const ignoreReport = this.createIgnoreReporter(sourceCode);
        Object.keys(rules).forEach(ruleId => {
            const ruleCreator = rules[ruleId];
            const ruleConfig = typeof rulesConfig[ruleId] !== "undefined" ? rulesConfig[ruleId] : true;
            const ruleContext = new RuleContext({
                ruleId,
                sourceCode,
                report,
                ignoreReport,
                textLintConfig,
                ruleConfig
            });
            const ruleObject = this.getRuleObject(ruleCreator, ruleContext, ruleConfig);
            this._addListenRule(ruleId, ruleObject);
        });
    }

    // add all the node types as listeners
    _addListenRule(key, rule) {
        Object.keys(rule).forEach(nodeType => {
            this.ruleTypeEmitter.on(nodeType, timing.enabled
                ? timing.time(key, rule[nodeType])
                : rule[nodeType]);
        });
    }
}
