// LICENSE : MIT
"use strict";
import CoreTask from "./textlint-core-task";
import { getFilter, getLinter } from "../core/rule-creator-helper";
import { createFreezedRuleContext } from "../core/rule-context";
import { createFreezedFilterRuleContext } from "../core/filter-rule-context";
import {
    TextlintKernelConstructorOptions,
    TextlintKernelFilterRule,
    TextlintKernelRule
} from "../textlint-kernel-interface";
import SourceCode from "../core/source-code";

const debug = require("debug")("textlint:TextLintCoreTask");

export interface TextLintCoreTaskArgs {
    config: TextlintKernelConstructorOptions;
    rules: TextlintKernelRule[];
    filterRules: TextlintKernelFilterRule[];
    sourceCode: SourceCode;
    configBaseDir?: string;
}

export default class TextLintCoreTask extends CoreTask {
    config: TextlintKernelConstructorOptions;
    rules: TextlintKernelRule[];
    filterRules: TextlintKernelFilterRule[];
    sourceCode: SourceCode;
    configBaseDir?: string;

    /**
     * @param {Config} config
     * @param {string} [configBaseDir]
     * @param {TextlintKernelRule[]} rules rules and config set
     * @param {TextlintKernelFilterRule[]} filterRules rules filter rules and config set
     * @param {SourceCode} sourceCode
     */
    constructor({ config, configBaseDir, rules, filterRules, sourceCode }: TextLintCoreTaskArgs) {
        super();
        this.config = config;
        this.configBaseDir = configBaseDir;
        this.rules = rules;
        this.filterRules = filterRules;
        this.sourceCode = sourceCode;
        this._setupRules();
    }

    start() {
        this.startTraverser(this.sourceCode);
    }

    _setupRules() {
        // rule
        const sourceCode = this.sourceCode;
        const report = this.createReporter(sourceCode);
        const ignoreReport = this.createShouldIgnore();
        // setup "rules" field
        // filter duplicated rules for improving experience
        // see https://github.com/textlint/textlint/issues/219
        debug("rules", this.rules);
        this.rules.forEach(({ ruleId, rule, options }) => {
            const ruleContext = createFreezedRuleContext({
                ruleId,
                ruleOptions: options,
                sourceCode,
                report,
                configBaseDir: this.configBaseDir
            });
            const ruleCreator = getLinter(rule);
            this.tryToAddListenRule(ruleCreator, ruleContext, options);
        });
        // setup "filters" field
        debug("filterRules", this.filterRules);
        this.filterRules.forEach(({ ruleId, rule, options }) => {
            const ruleContext = createFreezedFilterRuleContext({
                ruleId,
                sourceCode,
                ignoreReport,
                configBaseDir: this.configBaseDir
            });
            // "filters" rule is the same with "rules"
            const ruleModule = getFilter(rule);
            this.tryToAddListenRule(ruleModule, ruleContext, options);
        });
    }
}
