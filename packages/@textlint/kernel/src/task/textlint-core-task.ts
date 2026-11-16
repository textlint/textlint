// LICENSE : MIT
"use strict";
import { TextlintRuleErrorImpl } from "../context/TextlintRuleErrorImpl.js";
import { EventEmitter } from "./promise-event-emitter.js";
import { resolveLocation, resolveFixCommandLocation, resolveSuggestionsLocation } from "../core/source-location.js";
import timing from "../util/timing.js";
import { profiler } from "../profile/profiler.js";
import { invariant } from "../util/invariant.js";
import MessageType from "../shared/type/MessageType.js";
import type { AnyTxtNode } from "@textlint/ast-node-types";
import type {
    TextlintFilterRuleContext,
    TextlintFilterRuleOptions,
    TextlintFilterRuleReporter,
    TextlintFilterRuleShouldIgnoreFunction,
    TextlintFilterRuleShouldIgnoreFunctionArgs,
    TextlintMessageFixCommand,
    TextlintMessageSuggestion,
    TextlintRuleContext,
    TextlintRuleContextReportFunction,
    TextlintRuleContextReportFunctionArgs,
    TextlintRuleOptions,
    TextlintRuleReporter,
    TextlintSourceCode
} from "@textlint/types";
import { normalizeTextlintKeyPath } from "@textlint/utils";
import { TextlintRuleContextImpl } from "../context/TextlintRuleContextImpl.js";
import _debug from "debug";

const debug = _debug("textlint:core-task");

/**
 * A listener of a rule or a filter rule for a node type, or for `${type}:exit`
 */
type RuleListener = (node: AnyTxtNode) => void | Promise<void>;

/**
 * The listeners of a node type: `enter` for the type, and `exit` for `${type}:exit`
 */
type NodeTypeListeners = {
    readonly enter: readonly RuleListener[] | undefined;
    readonly exit: readonly RuleListener[] | undefined;
};

/**
 * Put in the work list of the traversal after the children of a node:
 * when it is popped, all the children of the node have been visited.
 */
const LEAVE = {} as AnyTxtNode;

const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Same as `isNode` of `@textlint/ast-traverse`
 */
const isTxtNode = (value: object): value is AnyTxtNode => {
    return typeof (value as AnyTxtNode).type === "string" || typeof (value as { t?: unknown }).t === "string";
};

/**
 * Call each listener with the node, and add the promises that the listeners return to `promises`
 */
const callListeners = (listeners: readonly RuleListener[], node: AnyTxtNode, promises: Promise<unknown>[]) => {
    for (let i = 0; i < listeners.length; i++) {
        // call it as a function, not as a method of the array, so that `this` in the listener is not the array
        const listener = listeners[i];
        const result = listener(node);
        if (result != null && typeof (result as PromiseLike<void>).then === "function") {
            promises.push(result);
        }
    }
};

export interface IgnoreReportedMessage {
    ruleId: string;
    type: typeof MessageType.ignore;
    // location info
    // TODO: compatible with TextLintMessage
    // line: number; // start with 1
    // column: number;// start with 1
    // // indexed-location
    // index: number;// start with 0
    range: readonly [startIndex: number, endIndex: number];

    ignoringRuleId: string;
}

export interface LintReportedMessage {
    type: typeof MessageType.lint;
    ruleId: string;
    message: string;
    index: number;
    line: number; // start with 1(1-based line number)
    column: number; // start with 1(1-based column number)
    // range is 0-based values
    range: readonly [startIndex: number, endIndex: number];
    // loc is 1-based values
    // line start with 1
    // column start with 1
    loc: {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    };
    severity: number; // it's for compatible ESLint formatter
    fix?: TextlintMessageFixCommand;
    suggestions?: TextlintMessageSuggestion[];
}

/**
 * CoreTask receive AST and prepare, traverse AST, emit nodeType event!
 * You can observe task and receive "message" event that is TextLintMessage.
 */
export default abstract class TextLintCoreTask extends EventEmitter {
    /**
     * The listeners of the rules by event name: a node type or `${type}:exit`.
     * The listeners are called in the order they are added, and a listener is added once for an event.
     */
    private ruleListeners: Map<string, RuleListener[]>;

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
        this.ruleListeners = new Map();
    }

    abstract start(): void;

    createShouldIgnore(): TextlintFilterRuleShouldIgnoreFunction {
        const shouldIgnore = (args: TextlintFilterRuleShouldIgnoreFunctionArgs) => {
            const { ruleId, range, optional } = args;
            invariant(
                typeof range[0] !== "undefined" && typeof range[1] !== "undefined" && range[0] >= 0 && range[1] >= 0,
                `ignoreRange should have actual range: ${range}`
            );
            // FIXME: should have index, loc
            // should be compatible with LintReportedMessage?
            const message: IgnoreReportedMessage = {
                type: MessageType.ignore,
                ruleId,
                range,
                // ignoring target ruleId - default: filter all messages
                // This ruleId should be normalized, because the user can report any value
                ignoringRuleId: optional.ruleId ? normalizeTextlintKeyPath(optional.ruleId) : "*"
            };
            this.emit(TextLintCoreTask.events.message, message);
        };
        return shouldIgnore;
    }

    createReporter(sourceCode: TextlintSourceCode): TextlintRuleContextReportFunction {
        /**
         * push new RuleError to results
         * @param {ReportMessage} reportArgs
         */
        const reportFunction = (reportArgs: TextlintRuleContextReportFunctionArgs) => {
            const { ruleId, node, severity, ruleError } = reportArgs;
            const { loc, range } = resolveLocation({
                source: sourceCode,
                ruleId,
                node,
                ruleError
            });
            const { fix } = resolveFixCommandLocation({
                node,
                ruleError
            });
            const { suggestions } = resolveSuggestionsLocation({ node, ruleError });
            debug("%s report %s", ruleId, ruleError);
            // add TextLintMessage
            const message: LintReportedMessage = {
                type: MessageType.lint,
                ruleId,
                message: ruleError.message,
                index: range[0],
                line: loc.start.line,
                column: loc.start.column,
                range,
                loc,
                severity, // it's for compatible ESLint formatter
                fix: fix !== undefined ? fix : undefined,
                suggestions: suggestions !== undefined ? suggestions : undefined
            };
            if (!(ruleError instanceof TextlintRuleErrorImpl)) {
                // FIXME: RuleReportedObject should be removed
                // `error` is a any data.
                const data = ruleError;
                (message as LintReportedMessage & { data: unknown }).data = data;
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
    startTraverser(sourceCode: TextlintSourceCode) {
        this.emit(TextLintCoreTask.events.start);
        const promiseQueue: Array<Promise<unknown>> = [];
        const ruleListeners = this.ruleListeners;
        // the listeners of each node type, to look up one Map for a node and not to create `${type}:exit` for every node
        const listenersByType = new Map<string, NodeTypeListeners>();
        const getListeners = (type: string): NodeTypeListeners => {
            let listeners = listenersByType.get(type);
            if (listeners === undefined) {
                listeners = { enter: ruleListeners.get(type), exit: ruleListeners.get(`${type}:exit`) };
                listenersByType.set(type, listeners);
            }
            return listeners;
        };
        // reuse the descriptor, because `parent` is defined on every node
        const parentDescriptor: PropertyDescriptor = { value: undefined };
        const profiling = profiler.enabled;
        const traverseStart = profiling ? performance.now() : 0;
        const listenerTimeStart = profiling ? profiler.listenerTime : 0;
        // Depth-first traversal in the same order as `@textlint/ast-traverse`.
        // The work list is a stack of the nodes to visit, and `LEAVE` marks the end of the children of the last node of `ancestors`.
        // Child nodes are the nodes in any property of a node, and in any array in a property of a node.
        const worklist: AnyTxtNode[] = [sourceCode.ast];
        const ancestors: AnyTxtNode[] = [];
        while (worklist.length > 0) {
            const node = worklist.pop() as AnyTxtNode;
            if (node === LEAVE) {
                const leftNode = ancestors.pop() as AnyTxtNode;
                // look up the listeners again, in case a listener has changed the type of the node
                const exitListeners = getListeners(leftNode.type).exit;
                if (exitListeners !== undefined) {
                    callListeners(exitListeners, leftNode, promiseQueue);
                }
                continue;
            }
            // the root node has `null` as the parent, as `@textlint/ast-traverse` gives
            parentDescriptor.value = ancestors.length > 0 ? ancestors[ancestors.length - 1] : null;
            Object.defineProperty(node, "parent", parentDescriptor);
            const enterListeners = getListeners(node.type).enter;
            if (enterListeners !== undefined) {
                callListeners(enterListeners, node, promiseQueue);
            }
            worklist.push(LEAVE);
            ancestors.push(node);
            // Push the child nodes, and then reverse them in the work list, to visit them in order.
            // `for...in` with `hasOwn` visits the same properties in the same order as `Object.keys`,
            // without creating an array of the keys for every node.
            const record = node as unknown as Record<string, unknown>;
            const childrenStart = worklist.length;
            for (const key in record) {
                // check it before reading the value, not to call a getter of an inherited property
                if (!hasOwnProperty.call(record, key)) {
                    continue;
                }
                const value = record[key];
                if (value === null || typeof value !== "object") {
                    continue;
                }
                if (Array.isArray(value)) {
                    for (let i = 0; i < value.length; i++) {
                        const child = value[i];
                        if (child !== null && typeof child === "object" && isTxtNode(child)) {
                            worklist.push(child);
                        }
                    }
                } else if (isTxtNode(value)) {
                    worklist.push(value);
                }
            }
            for (let i = childrenStart, j = worklist.length - 1; i < j; i++, j--) {
                const child = worklist[i];
                worklist[i] = worklist[j];
                worklist[j] = child;
            }
        }
        if (profiling) {
            // the time of the traversal and the dispatch, without the time of the listeners
            const listenerTime = profiler.listenerTime - listenerTimeStart;
            profiler.record(
                "traverse",
                undefined,
                Math.max(0, performance.now() - traverseStart - listenerTime),
                sourceCode.filePath
            );
        }
        Promise.all(promiseQueue)
            .then(() => {
                this.emit(TextLintCoreTask.events.complete);
            })
            .catch((error) => {
                this.emit(TextLintCoreTask.events.error, error);
            });
    }

    /**
     * try to get rule object
     */
    tryToGetRuleObject(
        ruleCreator: TextlintRuleReporter,
        ruleContext: Readonly<TextlintRuleContext>,
        ruleOptions?: TextlintRuleOptions
    ) {
        try {
            return ruleCreator(ruleContext, ruleOptions);
        } catch (error) {
            if (error instanceof Error) {
                error.message = `Error while loading rule '${ruleContext.id}': ${error.message}`;
            }
            throw error;
        }
    }

    /**
     * try to get filter rule object
     */
    tryToGetFilterRuleObject(
        ruleCreator: TextlintFilterRuleReporter,
        ruleContext: Readonly<TextlintFilterRuleContext>,
        ruleOptions?: TextlintFilterRuleOptions
    ) {
        try {
            return ruleCreator(ruleContext, ruleOptions);
        } catch (error) {
            if (error instanceof Error) {
                error.message = `Error while loading filter rule '${ruleContext.id}': ${error.message}`;
            }
            throw error;
        }
    }

    /**
     * add all the node types as listeners of the rule
     * @param {(...args: any[]) => any} ruleCreator
     * @param {Readonly<RuleContext>|Readonly<FilterRuleContext>} ruleContext
     * @param {Object|boolean|undefined} ruleOptions
     * @returns {Object}
     */
    tryToAddListenRule(
        ruleCreator: TextlintRuleReporter | TextlintFilterRuleReporter,
        ruleContext: Readonly<TextlintRuleContext> | Readonly<TextlintFilterRuleContext>,
        ruleOptions?: TextlintRuleOptions | TextlintFilterRuleOptions
    ): void {
        const ruleObject =
            ruleContext instanceof TextlintRuleContextImpl
                ? this.tryToGetRuleObject(
                      ruleCreator as TextlintRuleReporter,
                      ruleContext as Readonly<TextlintRuleContext>,
                      ruleOptions
                  )
                : this.tryToGetFilterRuleObject(
                      ruleCreator as TextlintFilterRuleReporter,
                      ruleContext as Readonly<TextlintFilterRuleContext>,
                      ruleOptions
                  );
        const types = Object.keys(ruleObject);
        const profileType = ruleContext instanceof TextlintRuleContextImpl ? "rule" : "filter-rule";
        types.forEach((nodeType) => {
            let listener = timing.enabled ? timing.time(ruleContext.id, ruleObject[nodeType]) : ruleObject[nodeType]!;
            if (profiler.enabled) {
                listener = profiler.wrapListener(profileType, ruleContext.id, ruleContext.getFilePath(), listener);
            }
            const listeners = this.ruleListeners.get(nodeType);
            if (listeners === undefined) {
                this.ruleListeners.set(nodeType, [listener as RuleListener]);
            } else if (!listeners.includes(listener as RuleListener)) {
                listeners.push(listener as RuleListener);
            }
        });
    }
}
