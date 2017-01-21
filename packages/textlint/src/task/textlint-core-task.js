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
import timing from "./../util/timing";
import MessageType from "../shared/type/MessageType";

// Promised EventEmitter
class RuleTypeEmitter extends PromiseEventEmitter {
    constructor() {
        super();
        this.setMaxListeners(0);
    }
}

/**
 * CoreTask receive AST and prepare, traverse AST, emit nodeType event!
 * You can observe task and receive "message" event that is TextLintMessage.
 */
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

    constructor() {
        super();
        this.ruleTypeEmitter = new RuleTypeEmitter();
    }

    createIgnoreReporter() {
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
        const reportFunction = (reportedMessage) => {
            const {ruleId, range, optional} = reportedMessage;
            assert(typeof range[0] !== "undefined" && typeof range[1] !== "undefined" && range[0] >= 0 && range[1] >= 0,
                "ignoreRange should have actual range: " + range);
            const message = {
                type: MessageType.ignore,
                ruleId: ruleId,
                range: range,
                // ignoring target ruleId - default: filter all messages
                ignoringRuleId: optional.ruleId || "*"
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
     * @param {SourceCode} sourceCode
     */
    startTraverser(sourceCode) {
        const promiseQueue = [];
        const listenerCount = (typeof this.ruleTypeEmitter.listenerCount !== "undefined")
            ? this.ruleTypeEmitter.listenerCount.bind(this.ruleTypeEmitter) // Node 4.x >=
            : EventEmitter.listenerCount.bind(EventEmitter, this.ruleTypeEmitter);// Node 0.12
        this.emit(TextLintCoreTask.events.start);
        const ruleTypeEmitter = this.ruleTypeEmitter;
        traverseController.traverse(sourceCode.ast, {
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
     * try to get rule object
     * @param {Function} ruleCreator
     * @param {RuleContext|FilterRuleContext} ruleContext
     * @param {Object|boolean} ruleConfig
     * @returns {Object}
     * @throws
     */
    tryToGetRuleObject(ruleCreator, ruleContext, ruleConfig) {
        try {
            return ruleCreator(ruleContext, ruleConfig);
        } catch (error) {
            error.message = `Error while loading rule '${ruleContext.id}': ${error.message}`;
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
    tryToAddListenRule(ruleCreator, ruleContext, ruleConfig) {
        const ruleObject = this.tryToGetRuleObject(ruleCreator, ruleContext, ruleConfig);
        Object.keys(ruleObject).forEach(nodeType => {
            this.ruleTypeEmitter.on(nodeType, timing.enabled
                ? timing.time(ruleContext.id, ruleObject[nodeType])
                : ruleObject[nodeType]);
        });
    }
}
