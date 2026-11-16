// LICENSE : MIT
"use strict";
import type {
    TextlintRuleContext,
    TextlintRuleContextReportFunction,
    TextlintRuleError,
    TextlintRuleOptions,
    TextlintRulePaddingLocator,
    TextlintRuleReportedObject,
    TextlintRuleReporter,
    TextlintRuleCreateOnce,
    TextlintRuleSeverityLevel,
    TextlintSourceCode
} from "@textlint/types";
import { ASTNodeTypes, TxtNode } from "@textlint/ast-node-types";
import type { TextlintKernelRule } from "../textlint-kernel-interface.js";
import { TextlintRuleContextImpl } from "../context/TextlintRuleContextImpl.js";

/**
 * Return true when the rule function has `createOnce`.
 * `createOnce(context, options)` is called one time, and its listeners are used for every file.
 */
export const hasCreateOnce = (
    ruleCreator: TextlintRuleReporter
): ruleCreator is TextlintRuleReporter & { createOnce: TextlintRuleCreateOnce } => {
    return typeof ruleCreator.createOnce === "function";
};

/**
 * The file that a created rule reports to
 */
export interface OnceRuleFile {
    sourceCode: TextlintSourceCode;
    report: TextlintRuleContextReportFunction;
    configBaseDir?: string;
}

// the same type as the listeners of the emitter, which pass the node as the only argument
type OnceRuleListener = (node: unknown) => void;

/**
 * A rule that `createOnce` created.
 * The context and the listeners are the same objects for every file,
 * and the context refers to the file that `bind()` set.
 */
export type { OnceRuleListener };

export class OnceRule {
    readonly context: TextlintRuleContext;
    readonly listeners: ReadonlyArray<readonly [type: string, listener: OnceRuleListener]>;
    private file: OnceRuleFile | undefined = undefined;

    constructor({
        ruleId,
        severityLevel,
        createOnce,
        ruleOptions
    }: {
        ruleId: string;
        severityLevel: TextlintRuleSeverityLevel;
        createOnce: TextlintRuleCreateOnce;
        ruleOptions?: TextlintRuleOptions;
    }) {
        // the context delegates the methods that need a file to the bound file
        const context = new TextlintRuleContextImpl({
            ruleId,
            severityLevel,
            sourceCode: this.createSourceCodeProxy(ruleId),
            report: (args) => this.currentFile(ruleId, "report").report(args),
            configBaseDir: undefined
        });
        this.context = createOnceContext(context, () => this.currentFile(ruleId, "getConfigBaseDir").configBaseDir);
        let handler;
        try {
            handler = createOnce(this.context, ruleOptions);
        } catch (error) {
            if (error instanceof Error) {
                error.message = `Error while loading rule '${ruleId}': ${error.message}`;
            }
            throw error;
        }
        this.listeners = Object.keys(handler).map((type) => {
            const listener = handler[type]!;
            const checked: OnceRuleListener = (node) => {
                const result: unknown = listener(node);
                if (
                    result !== undefined &&
                    result !== null &&
                    typeof (result as { then?: unknown }).then === "function"
                ) {
                    // the lint fails with the error below; consume the rejection of the listener,
                    // which can fail later when it reports after the traversal
                    Promise.resolve(result).catch(() => undefined);
                    throw new Error(
                        `Rule '${ruleId}' returned a Promise from the '${type}' listener. The listeners of a rule with createOnce must be synchronous. Use the rule function without createOnce for an asynchronous rule.`
                    );
                }
            };
            return [type, checked] as const;
        });
    }

    /**
     * Set the file that the context refers to, and return the previous one to restore it.
     */
    bind(file: OnceRuleFile | undefined): OnceRuleFile | undefined {
        const previous = this.file;
        this.file = file;
        return previous;
    }

    private currentFile(ruleId: string, method: string): OnceRuleFile {
        const file = this.file;
        if (file === undefined) {
            throw new Error(
                `Rule '${ruleId}' called context.${method}() outside its listeners. A rule with createOnce can call it only in a listener, because the context refers to the file being linted.`
            );
        }
        return file;
    }

    private createSourceCodeProxy(ruleId: string): TextlintSourceCode {
        // TextlintRuleContextImpl uses only these methods of the source code
        return {
            getSyntax: () => ASTNodeTypes,
            getFilePath: () => this.currentFile(ruleId, "getFilePath").sourceCode.getFilePath(),
            getSource: (node?: TxtNode, beforeCount?: number, afterCount?: number) =>
                this.currentFile(ruleId, "getSource").sourceCode.getSource(node, beforeCount, afterCount)
        } as unknown as TextlintSourceCode;
    }
}

/**
 * `TextlintRuleContextImpl` keeps `configBaseDir` for its lifetime, but it can differ for each file.
 */
const createOnceContext = (
    context: TextlintRuleContextImpl,
    getConfigBaseDir: () => string | undefined
): TextlintRuleContext => {
    return Object.freeze({
        get id(): string {
            return context.id;
        },
        get severity(): TextlintRuleSeverityLevel {
            return context.severity;
        },
        get Syntax(): typeof ASTNodeTypes {
            return ASTNodeTypes;
        },
        get RuleError() {
            return context.RuleError;
        },
        get fixer() {
            return context.fixer;
        },
        locator: context.locator as TextlintRulePaddingLocator,
        report: context.report as (
            node: TxtNode,
            ruleError: TextlintRuleReportedObject | TextlintRuleError,
            _shouldNotUsed?: never
        ) => void,
        getFilePath: context.getFilePath,
        getSource: context.getSource,
        getConfigBaseDir: getConfigBaseDir
    });
};

/**
 * The rules that `createOnce` created, for each rule entry of a kernel.
 * The lint and the fix use different functions of a fixable rule, so they are kept separately.
 */
export class OnceRuleStore {
    private lintRules = new WeakMap<TextlintKernelRule, OnceRule>();
    private fixRules = new WeakMap<TextlintKernelRule, OnceRule>();

    get(mode: "lint" | "fix", kernelRule: TextlintKernelRule, create: () => OnceRule): OnceRule {
        const rules = mode === "lint" ? this.lintRules : this.fixRules;
        let rule = rules.get(kernelRule);
        if (rule === undefined) {
            rule = create();
            rules.set(kernelRule, rule);
        }
        return rule;
    }
}
