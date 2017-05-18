// LICENSE : MIT
"use strict";
import CoreTask from "./textlint-core-task";
import { getLinter, getFilter } from "../core/rule-creator-helper";
import RuleContext from "../core/rule-context";
import FilterRuleContext from "../core/filter-rule-context";

const debug = require("debug")("textlint:TextLintCoreTask");
export default class TextLintCoreTask extends CoreTask {
    /**
     * @param {Config} config
     * @param {TextlintKernelRule[]} rules rules and config set
     * @param {TextlintKernelFilterRule[]} filterRules rules filter rules and config set
     * @param {SourceCode} sourceCode
     */
    constructor({ config, rules, filterRules, sourceCode }) {
        super();
        this.config = config;
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
        const textLintConfig = this.config;
        const sourceCode = this.sourceCode;
        const report = this.createReporter(sourceCode);
        const ignoreReport = this.createIgnoreReporter(sourceCode);
        // setup "rules" field
        // filter duplicated rules for improving experience
        // see https://github.com/textlint/textlint/issues/219
        debug("rules", this.rules);
        this.rules.forEach(({ ruleId, rule, options }) => {
            const ruleContext = new RuleContext({
                ruleId,
                ruleOptions: options,
                sourceCode,
                report,
                ignoreReport,
                textLintConfig
            });
            const ruleModule = getLinter(rule);
            this.tryToAddListenRule(ruleModule, ruleContext, options);
        });
        // setup "filters" field
        debug("filterRules", this.filterRules);
        this.filterRules.forEach(({ ruleId, rule, options }) => {
            const ruleContext = new FilterRuleContext({
                ruleId,
                ruleOptions: options,
                sourceCode,
                ignoreReport,
                textLintConfig
            });
            // "filters" rule is the same with "rules"
            const ruleModule = getFilter(rule);
            this.tryToAddListenRule(ruleModule, ruleContext, options);
        });
    }
}
