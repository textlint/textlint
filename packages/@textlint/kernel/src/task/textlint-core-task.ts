// LICENSE : MIT
"use strict";
import { TextlintRuleErrorImpl } from "../context/TextlintRuleErrorImpl.js";
import { EventEmitter, PromiseEventEmitter } from "./promise-event-emitter.js";
import { resolveLocation, resolveFixCommandLocation } from "../core/source-location.js";
import timing from "../util/timing.js";
import { invariant } from "../util/invariant.js";
import MessageType from "../shared/type/MessageType.js";
import { AnyTxtNode, TxtParentNode } from "@textlint/ast-node-types";
import type {
    TextlintFilterRuleContext,
    TextlintFilterRuleOptions,
    TextlintFilterRuleReporter,
    TextlintFilterRuleShouldIgnoreFunction,
    TextlintFilterRuleShouldIgnoreFunctionArgs,
    TextlintMessageFixCommand,
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
import { Controller as TraverseController } from "@textlint/ast-traverse";

const traverseController = new TraverseController();
const debug = _debug("textlint:core-task");

class RuleTypeEmitter extends PromiseEventEmitter {}

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
}

/**
 * CoreTask receive AST and prepare, traverse AST, emit nodeType event!
 * You can observe task and receive "message" event that is TextLintMessage.
 */
export default abstract class TextLintCoreTask extends EventEmitter {
    private ruleTypeEmitter: RuleTypeEmitter;

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
                fix: fix !== undefined ? fix : undefined
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
        const promiseQueue: Array<Promise<Array<void>>> = [];
        const ruleTypeEmitter = this.ruleTypeEmitter;
        traverseController.traverse(sourceCode.ast as TxtParentNode, {
            enter(node: AnyTxtNode, parent?: AnyTxtNode) {
                const type = node.type;
                Object.defineProperty(node, "parent", { value: parent });
                if (ruleTypeEmitter.listenerCount(type) > 0) {
                    const promise = ruleTypeEmitter.emit(type, node);
                    promiseQueue.push(promise);
                }
            },
            leave(node: AnyTxtNode) {
                const type = `${node.type}:exit`;
                if (ruleTypeEmitter.listenerCount(type) > 0) {
                    const promise = ruleTypeEmitter.emit(type, node);
                    promiseQueue.push(promise);
                }
            }
        });
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
        types.forEach((nodeType) => {
            this.ruleTypeEmitter.on(
                nodeType,
                timing.enabled ? timing.time(ruleContext.id, ruleObject[nodeType]) : ruleObject[nodeType]!
            );
        });
    }
}
