// LICENSE : MIT
"use strict";
import CoreTask from "./textlint-core-task";
import { getFixer, getFilter } from "../core/rule-creator-helper";
import RuleContext from "../core/rule-context";
import FilterRuleContext from "../core/filter-rule-context";

const debug = require("debug")("textlint:TextLintCoreTask");
export default class TextLintCoreTask extends CoreTask {
    /**
     * @param {Config} config
     * @param {string} [configBaseDir]
     * @param {TextlintKernelRule} fixerRule rules has fixer
     * @param {TextlintKernelFilterRule[]} filterRules filter rules and config set
     * @param {SourceCode} sourceCode
     */
    constructor({ config, configBaseDir, fixerRule, filterRules, sourceCode }) {
        super();
        this.config = config;
        this.configBaseDir = configBaseDir;
        this.fixerRule = fixerRule;
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
        // setup "rules" field by using a single fixerRule
        debug("fixerRule", this.fixerRule);
        const ruleContext = new RuleContext({
            ruleId: this.fixerRule.ruleId,
            ruleOptions: this.fixerRule.options,
            sourceCode,
            report,
            ignoreReport,
            textLintConfig,
            configBaseDir: this.configBaseDir
        });
        const ruleModule = getFixer(this.fixerRule.rule);
        this.tryToAddListenRule(ruleModule, ruleContext, this.fixerRule.options);
        // setup "filters" field
        debug("filterRules", this.filterRules);
        this.filterRules.forEach(({ ruleId, rule, options }) => {
            const ruleContext = new FilterRuleContext({
                ruleId,
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
