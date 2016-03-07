// LICENSE : MIT
"use strict";
const EventEmitter = require("events");
const TraverseController = require("txt-ast-traverse").Controller;
const RuleError = require("./../rule/rule-error");
const PromiseEventEmitter = require("carrack");
const SourceLocation = require("./../rule/source-location");
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

    constructor({config, rules, rulesConfig, sourceCode}) {
        super();
        this.config = config;
        this.rules = rules;
        this.rulesConfig = rulesConfig;
        this.sourceCode = sourceCode;
        this.sourceLocation = new SourceLocation(this.sourceCode);
        this.ruleTypeEmitter = new RuleTypeEmitter();
    }

    /**
     * push new RuleError to results
     * @param {string} ruleId
     * @param {TxtNode} node
     * @param {number} severity
     * @param {RuleError|any} error error is a RuleError instance or any data
     */
    report({ruleId, node, severity, error}) {
        debug("pushReport %s", error);
        const {line, column, fix} = this.sourceLocation.adjust(node, error);
        // add TextLintMessage
        const message = {
            ruleId: ruleId,
            message: error.message,
            // See https://github.com/textlint/textlint/blob/master/typing/textlint.d.ts
            line: line,        // start with 1(1-based line number)
            column: column + 1,// start with 1(1-based column number)
            severity: severity // it's for compatible ESLint formatter
        };
        if (fix) {
            message.fix = fix;
        }
        if (!(error instanceof RuleError)) {
            // `error` is a any data.
            const data = error;
            message.data = data;
        }
        this.emit(TextLintCoreTask.events.message, message);
    }

    /**
     * Process ast tree.
     * You can listen message by `task.on("message", message => {})`
     * @param {TxtNode} astTree astTree is compatible TxtNode tree.
     */
    process(astTree) {
        const promiseQueue = [];
        const listenerCount = (typeof this.ruleTypeEmitter.listenerCount !== "undefined")
            ? this.ruleTypeEmitter.listenerCount.bind(this.ruleTypeEmitter) // Node 4.x >=
            : EventEmitter.listenerCount.bind(EventEmitter, this.ruleTypeEmitter);// Node 0.12

        this.emit(TextLintCoreTask.events.start);

        const ruleTypeEmitter = this.ruleTypeEmitter;
        traverseController.traverse(astTree, {
            enter(node, parent) {
                const type = node.type;
                Object.defineProperty(node, "parent", {value: parent});
                if (listenerCount(type) > 0) {
                    let promise = ruleTypeEmitter.emit(type, node);
                    promiseQueue.push(promise);
                }
            },
            leave(node) {
                const type = `${node.type}:exit`;
                if (listenerCount(type) > 0) {
                    let promise = ruleTypeEmitter.emit(type, node);
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