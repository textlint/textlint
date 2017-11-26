/// <reference types="node" />
import RuleError from "../core/rule-error";
import MessageType from "../shared/type/MessageType";
import { EventEmitter } from "events";
import SourceCode from "../core/source-code";
import { TextLintFixCommand, TextlintRuleOptions, TxtNode } from "../textlint-kernel-interface";
import { default as RuleContext, RuleReportedObject } from "../core/rule-context";
import { RuleCreatorReporter } from "../core/rule-creator-helper";
import FilterRuleContext from "../core/filter-rule-context";
/**
 * Ignoring Report function
 */
/**
 * Message of ignoring
 * @typedef {Object} ReportIgnoreMessage
 * @property {string} ruleId
 * @property {number[]} range
 * @property {string} ignoringRuleId to ignore ruleId
 * "*" is special case, it match all ruleId(work as wildcard).
 */
export interface ShouldIgnoreArgs {
    ruleId: string;
    range: [number, number];
    optional: {
        ruleId?: string;
    };
}
export interface IgnoreReportedMessage {
    ruleId: string;
    type: typeof MessageType.ignore;
    range: [number, number];
    ignoringRuleId: string;
}
export declare type ShouldIgnoreFunction = (args: ShouldIgnoreArgs) => void;
/**
 * context.report function
 */
export interface ReportArgs {
    ruleId: string;
    node: TxtNode;
    severity: number;
    ruleError: RuleError | RuleReportedObject;
}
export declare type ReportFunction = (args: ReportArgs) => void;
export interface LintReportedMessage {
    type: typeof MessageType.lint;
    ruleId: string;
    message: string;
    index: number;
    line: number;
    column: number;
    severity: number;
    fix?: TextLintFixCommand;
}
/**
 * CoreTask receive AST and prepare, traverse AST, emit nodeType event!
 * You can observe task and receive "message" event that is TextLintMessage.
 */
export default abstract class TextLintCoreTask extends EventEmitter {
    private ruleTypeEmitter;
    static readonly events: {
        start: string;
        message: string;
        complete: string;
        error: string;
    };
    constructor();
    abstract start(): void;
    createShouldIgnore(): ShouldIgnoreFunction;
    createReporter(sourceCode: SourceCode): ReportFunction;
    /**
     * start process and emitting events.
     * You can listen message by `task.on("message", message => {})`
     * @param {SourceCode} sourceCode
     */
    startTraverser(sourceCode: SourceCode): void;
    /**
     * try to get rule object
     * @param {Function} ruleCreator
     * @param {RuleContext|FilterRuleContext} ruleContext
     * @param {Object|boolean|undefined} ruleOptions
     * @returns {Object}
     * @throws
     */
    tryToGetRuleObject(ruleCreator: RuleCreatorReporter, ruleContext: RuleContext | FilterRuleContext, ruleOptions?: TextlintRuleOptions | boolean): {
        Document?: ((node: TxtNode) => void | Promise<any>) | undefined;
        Paragraph?: ((node: TxtNode) => void | Promise<any>) | undefined;
        BlockQuote?: ((node: TxtNode) => void | Promise<any>) | undefined;
        ListItem?: ((node: TxtNode) => void | Promise<any>) | undefined;
        List?: ((node: TxtNode) => void | Promise<any>) | undefined;
        Header?: ((node: TxtNode) => void | Promise<any>) | undefined;
        CodeBlock?: ((node: TxtNode) => void | Promise<any>) | undefined;
        HtmlBlock?: ((node: TxtNode) => void | Promise<any>) | undefined;
        ReferenceDef?: ((node: TxtNode) => void | Promise<any>) | undefined;
        HorizontalRule?: ((node: TxtNode) => void | Promise<any>) | undefined;
        Comment?: ((node: TxtNode) => void | Promise<any>) | undefined;
        Str?: ((node: TxtNode) => void | Promise<any>) | undefined;
        Break?: ((node: TxtNode) => void | Promise<any>) | undefined;
        Emphasis?: ((node: TxtNode) => void | Promise<any>) | undefined;
        Strong?: ((node: TxtNode) => void | Promise<any>) | undefined;
        Html?: ((node: TxtNode) => void | Promise<any>) | undefined;
        Link?: ((node: TxtNode) => void | Promise<any>) | undefined;
        Image?: ((node: TxtNode) => void | Promise<any>) | undefined;
        Code?: ((node: TxtNode) => void | Promise<any>) | undefined;
        Delete?: ((node: TxtNode) => void | Promise<any>) | undefined;
    };
    /**
     * add all the node types as listeners of the rule
     * @param {Function} ruleCreator
     * @param {RuleContext|FilterRuleContext} ruleContext
     * @param {Object|boolean|undefined} ruleOptions
     * @returns {Object}
     */
    tryToAddListenRule(ruleCreator: RuleCreatorReporter, ruleContext: RuleContext | FilterRuleContext, ruleOptions?: TextlintRuleOptions | boolean): void;
}
