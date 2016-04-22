// LICENSE : MIT
"use strict";
const EventEmitter = require("events");
const TraverseController = require("txt-ast-traverse").Controller;
const PromiseEventEmitter = require("carrack");
import RuleError from "../core/rule-error";
import SourceLocation from "../core/source-location";
const traverseController = new TraverseController();
const debug = require("debug")("textlint:core-task");
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
    }

    createIgnoreReporter(sourceCode) {
        /**
         * @typedef {Object} ReportMessage
         * @property {string} ruleId
         * @property {number[]} ignoreRange
         */
        /**
         * push new RuleError to results
         * @param {ReportMessage} reportedMessage
         */
        const reportFunction = (reportedMessage) => {
            const {ruleId, node} = reportedMessage;
            // add TextLintMessage
            const message = {
                ruleId: ruleId,
                ignoreRange: node.range
            };
            this.emit(TextLintCoreTask.events.ignoreMessage, message);
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
}
