// LICENSE : MIT
"use strict";
import CoreTask from "./textlint-core-task.js";
import { TextlintKernelConstructorOptions } from "../textlint-kernel-interface.js";
import { TextlintFilterRuleDescriptors, TextlintFixableRuleDescriptor } from "../descriptor/index.js";
import type { TextlintSourceCode } from "@textlint/types";
import { getSeverity } from "../shared/rule-severity.js";
import { TextlintFilterRuleContextImpl } from "../context/TextlintFilterRuleContextImpl.js";
import { hasCreateOnce, OnceRule, OnceRuleStore } from "./once-rule.js";
import { TextlintRuleContextImpl } from "../context/TextlintRuleContextImpl.js";
import _debug from "debug";

const debug = _debug("textlint:TextLintCoreTask");

export interface TextLintCoreTaskArgs {
    config: TextlintKernelConstructorOptions;
    fixableRuleDescriptor: TextlintFixableRuleDescriptor;
    filterRuleDescriptors: TextlintFilterRuleDescriptors;
    sourceCode: TextlintSourceCode;
    configBaseDir?: string;
    onceRuleStore?: OnceRuleStore;
}

export default class TextLintCoreTask extends CoreTask {
    config: TextlintKernelConstructorOptions;
    fixableRuleDescriptor: TextlintFixableRuleDescriptor;
    filterRuleDescriptors: TextlintFilterRuleDescriptors;
    sourceCode: TextlintSourceCode;
    configBaseDir?: string;
    onceRuleStore?: OnceRuleStore;

    constructor({
        config,
        configBaseDir,
        fixableRuleDescriptor,
        filterRuleDescriptors,
        sourceCode,
        onceRuleStore
    }: TextLintCoreTaskArgs) {
        super();
        this.onceRuleStore = onceRuleStore;
        this.config = config;
        this.configBaseDir = configBaseDir;
        this.fixableRuleDescriptor = fixableRuleDescriptor;
        this.filterRuleDescriptors = filterRuleDescriptors;
        this.sourceCode = sourceCode;
        this._setupRules();
    }

    start() {
        this.startTraverser(this.sourceCode);
    }

    private _setupRules() {
        // rule
        const sourceCode = this.sourceCode;
        const report = this.createReporter(sourceCode);
        const ignoreReport = this.createShouldIgnore();
        // setup "rules" field by using a single fixerRule
        debug("fixerRule", this.fixableRuleDescriptor);
        const fixableRuleDescriptor = this.fixableRuleDescriptor;
        const fixer = fixableRuleDescriptor.fixer;
        if (this.onceRuleStore !== undefined && hasCreateOnce(fixer)) {
            const ruleOptions = fixableRuleDescriptor.normalizedOptions;
            const onceRule = this.onceRuleStore.get(
                "fix",
                fixableRuleDescriptor.toKernel(),
                () =>
                    new OnceRule({
                        ruleId: fixableRuleDescriptor.id,
                        severityLevel: getSeverity(ruleOptions),
                        createOnce: fixer.createOnce,
                        ruleOptions
                    })
            );
            this.addOnceRule(onceRule, { sourceCode, report, configBaseDir: this.configBaseDir });
        } else {
            this.addFixerRule(sourceCode, report);
        }
        this.addFilterRules(sourceCode, ignoreReport);
    }

    private addFixerRule(sourceCode: TextlintSourceCode, report: ReturnType<CoreTask["createReporter"]>) {
        const ruleContext = new TextlintRuleContextImpl({
            ruleId: this.fixableRuleDescriptor.id,
            severityLevel: getSeverity(this.fixableRuleDescriptor.normalizedOptions),
            sourceCode,
            report,
            configBaseDir: this.configBaseDir
        });
        this.tryToAddListenRule(
            this.fixableRuleDescriptor.fixer,
            ruleContext,
            this.fixableRuleDescriptor.normalizedOptions
        );
    }

    private addFilterRules(sourceCode: TextlintSourceCode, ignoreReport: ReturnType<CoreTask["createShouldIgnore"]>) {
        // setup "filters" field
        debug("filterRules", this.filterRuleDescriptors);
        this.filterRuleDescriptors.descriptors.forEach((filterRuleDescriptor) => {
            const ruleContext = new TextlintFilterRuleContextImpl({
                ruleId: filterRuleDescriptor.id,
                severityLevel: getSeverity(filterRuleDescriptor.normalizedOptions),
                sourceCode,
                ignoreReport,
                configBaseDir: this.configBaseDir
            });
            this.tryToAddListenRule(filterRuleDescriptor.filter, ruleContext, filterRuleDescriptor.normalizedOptions);
        });
    }
}
