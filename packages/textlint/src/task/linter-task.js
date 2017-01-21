// LICENSE : MIT
"use strict";
import CoreTask from "./textlint-core-task";
import {getLinter, getFilter} from "../core/rule-creator-helper";
import RuleContext from "../core/rule-context";
import FilterRuleContext from "../core/filter-rule-context";
const debug = require("debug")("textlint:TextLintCoreTask");
export default class TextLintCoreTask extends CoreTask {
    /**
     * @param {Config} config
     * @param {RuleCreatorSet} ruleCreatorSet rules and config set
     * @param {RuleCreatorSet} filterRuleCreatorSet filter rules and config set
     * @param {SourceCode} sourceCode
     */
    constructor({config, ruleCreatorSet, filterRuleCreatorSet, sourceCode}) {
        super();
        this.config = config;
        this.ruleCreatorSet = ruleCreatorSet;
        this.filterRuleCreatorSet = filterRuleCreatorSet;
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
        const ruleCreatorSet = this.ruleCreatorSet.withoutDuplicated();
        debug("ruleCreatorSet", ruleCreatorSet);
        ruleCreatorSet.forEach(({ruleId, rule, ruleConfig}) => {
            const ruleContext = new RuleContext({
                ruleId,
                sourceCode,
                report,
                ignoreReport,
                textLintConfig,
                ruleConfig
            });
            const ruleModule = getLinter(rule);
            this.tryToAddListenRule(ruleModule, ruleContext, ruleConfig);
        });
        // setup "filters" field
        debug("filterRuleCreatorSet", this.filterRuleCreatorSet);
        this.filterRuleCreatorSet.forEach(({ruleId, rule, ruleConfig}) => {
            const ruleContext = new FilterRuleContext({
                ruleId,
                sourceCode,
                ignoreReport,
                textLintConfig
            });
            // "filters" rule is the same with "rules"
            const ruleModule = getFilter(rule);
            this.tryToAddListenRule(ruleModule, ruleContext, ruleConfig);
        });
    }
}
