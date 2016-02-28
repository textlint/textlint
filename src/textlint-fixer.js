// LICENSE : MIT
"use strict";
const assert = require("assert");
const RuleContext = require('./rule/rule-context');
const RuleContextAgent = require("./rule/rule-context-agent");
const TraverseController = require('txt-ast-traverse').Controller;
const timing = require("./util/timing");
const SourceCodeFixer = require("./fixer/source-code-fixer");
//
function replaceRange(text, start, end, substitute) {
    return text.substring(0, start) + substitute + text.substring(end);
}
// add all the node types as listeners
function addListenRule(key, rule, target) {
    Object.keys(rule).forEach(nodeType => {
        target.on(nodeType, timing.enabled
            ? timing.time(key, rule[nodeType])
            : rule[nodeType]);
    });
}

export default class TextLintFixer {
    constructor({rules, rulesConfig}) {
        this.rules = rules;
        this.rulesConfig = rulesConfig;

    }

    _createRuleContextAgent(key, text, filePath, ruleCreator) {
        const ruleContextAgent = new RuleContextAgent(text, filePath);
        const ruleConfig = {};
        try {
            let ruleContext = new RuleContext(key, ruleContextAgent, this.config, ruleConfig);
            let rule = ruleCreator(ruleContext, ruleConfig);
            addListenRule(key, rule, ruleContextAgent);
        } catch (ex) {
            ex.message = `Error while loading rule '${ key }': ${ ex.message }`;
            throw ex;
        }
        return ruleContextAgent;
    }

    process(processor, text, ext, filePath) {
        const {preProcess, postProcess} = processor.processor(ext);
        assert(typeof preProcess === "function" && typeof postProcess === "function",
            `processor should implement {preProcess, postProcess}`);
        const parse = (text) => {
            return preProcess(text, filePath);
        };
        const fixerRules = Object.keys(this.rules).map(ruleName => {
            return this.rules[ruleName];
        }).filter(rule => {
            return typeof rule["fixer"] !== "undefined";
        });
        const traverseController = new TraverseController();
        const fixerProcessList = fixerRules.map(rule => {
            return (textForProcess) => {
                const promiseQueue = [];
                // create context
                const ruleContextAgent = this._createRuleContextAgent("", textForProcess, filePath, rule["fixer"]);
                const AST = parse(textForProcess);
                const listenerCount = (typeof ruleContextAgent.listenerCount !== 'undefined')
                    ? ruleContextAgent.listenerCount.bind(ruleContextAgent) // Node 4.x >=
                    : EventEmitter.listenerCount.bind(EventEmitter, ruleContextAgent);// Node 0.12
                traverseController.traverse(AST, {
                    enter(node, parent) {
                        const type = node.type;
                        Object.defineProperty(node, 'parent', {value: parent});
                        if (listenerCount(type) > 0) {
                            let promise = ruleContextAgent.emit(type, node);
                            promiseQueue.push(promise);
                        }
                    },
                    leave(node) {
                        const type = `${node.type}:exit`;
                        if (listenerCount(type) > 0) {
                            let promise = ruleContextAgent.emit(type, node);
                            promiseQueue.push(promise);
                        }
                    }
                });
                return Promise.all(promiseQueue).then(() => {
                    let messages = ruleContextAgent.messages;
                    let result = postProcess(messages, filePath);
                    assert(result.filePath && result.messages.length >= 0, "postProcess should return { messages, filePath } ");
                    const applied = SourceCodeFixer.applyFixes(textForProcess, messages);
                    if (applied.fixed) {
                        console.log("FIXED: " + applied.output);
                        return applied.output;
                    }
                    return textForProcess;
                });
            };
        });

        const resultPromise = fixerProcessList.reduce((promise, fixerProcess) => {
            return promise.then((text) => {
                return fixerProcess(text);
            });
        }, Promise.resolve(text));

        return resultPromise;
    }
}