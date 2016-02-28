// LICENSE : MIT
"use strict";
const EventEmitter = require("events");
const TraverseController = require('txt-ast-traverse').Controller;
const RuleContext = require("./rule/rule-context");
const timing = require("./util/timing");
const RuleError = require("./rule/rule-error");
const PromiseEventEmitter = require("carrack");
const computeLocation = require("./rule/compute-location");
const traverseController = new TraverseController();
const debug = require("debug")("textlint:core-task");
class RuleTypeEmitter extends PromiseEventEmitter {
    constructor(){
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
            complete: "complete"
        };
    }

    constructor({config, rules, rulesConfig, sourceCode}) {
        super();
        this.config = config;
        this.rules = rules;
        this.rulesConfig = rulesConfig;
        this.sourceCode = sourceCode;
        this.ruleTypeEmitter = new RuleTypeEmitter();
        /**
         * push new RuleError to results
         * @param {string} ruleId
         * @param {TxtNode} node
         * @param {number} severity
         * @param {RuleError|any} error error is a RuleError instance or any data
         */
        const report = ({ruleId, node, severity, error}) => {
            debug('pushReport %s', error);
            let {line, column} = computeLocation(node, error);
            // add TextLintMessage
            let message = {
                ruleId: ruleId,
                message: error.message,
                // See https://github.com/textlint/textlint/blob/master/typing/textlint.d.ts
                line: line,        // start with 1(1-based line number)
                column: column + 1,// start with 1(1-based column number)
                severity: severity // it's for compatible ESLint formatter
            };
            if (!(error instanceof RuleError)) {
                // `error` is a any data.
                const data = error;
                message.data = data;
            }
            this.emit(TextLintCoreTask.events.message, message);
        };

        this._setupRuleCreatorListener(report);
    }

    _setupRuleCreatorListener(report) {
        const rules = this.rules;
        const config = this.config;
        const rulesConfig = this.rulesConfig;
        const textLintConfig = config;
        const sourceCode = this.sourceCode;
        Object.keys(rules).forEach(key => {
            const ruleCreator = rules[key];
            const ruleConfig = rulesConfig[key];
            try {
                const ruleContext = new RuleContext(key, sourceCode, report, textLintConfig, ruleConfig);
                let rule;
                if (typeof ruleCreator === "function") {
                    rule = ruleCreator(ruleContext, ruleConfig);
                } else if (ruleCreator.hasOwnProperty("fixer")) {
                    rule = ruleCreator.fixer(ruleContext, ruleConfig);
                }
                this._addListenRule(key, rule);
            } catch (ex) {
                ex.message = `Error while loading rule '${ key }': ${ ex.message }`;
                throw ex;
            }
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

    /**
     * Process ast tree.
     * You can listen message by `task.on("message", message => {})`
     * @param {TxtNode} astTree astTree is compatible TxtNode tree.
     */
    process(astTree) {
        const promiseQueue = [];
        const listenerCount = (typeof this.ruleTypeEmitter.listenerCount !== 'undefined')
            ? this.ruleTypeEmitter.listenerCount.bind(this.ruleTypeEmitter) // Node 4.x >=
            : EventEmitter.listenerCount.bind(EventEmitter, this.ruleTypeEmitter);// Node 0.12

        this.emit(TextLintCoreTask.events.start);

        const ruleTypeEmitter = this.ruleTypeEmitter;
        traverseController.traverse(astTree, {
            enter(node, parent) {
                const type = node.type;
                Object.defineProperty(node, 'parent', {value: parent});
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
        });
    }
}