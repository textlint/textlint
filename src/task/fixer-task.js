// LICENSE : MIT
"use strict";
import CoreTask from "./textlint-core-task";
import RuleContext from "../core/rule-context";
import timing from "./../util/timing";
import {getFixer} from "../core/rule-creator-helper";
export default class TextLintCoreTask extends CoreTask {
    constructor(...args) {
        super(...args);
        this._setupRuleCreatorListener();
    }

    /**
     * setup ruleTypeEmitter
     * @private
     */
    _setupRuleCreatorListener() {
        const rules = this.ruleCreatorSet.rules;
        const rulesConfig = this.ruleCreatorSet.rulesConfig;
        const config = this.config;
        const textLintConfig = config;
        const sourceCode = this.sourceCode;
        const report = this.createReporter(sourceCode);
        Object.keys(rules).forEach(key => {
            const ruleCreator = rules[key];
            const ruleConfig = rulesConfig[key];
            try {
                const ruleContext = new RuleContext(key, sourceCode, report, textLintConfig, ruleConfig);
                const ruleObject = getFixer(ruleCreator)(ruleContext, ruleConfig);
                this._addListenRule(key, ruleObject);
            } catch (ex) {
                ex.message = `Error while loading rule '${ key }': ${ ex.message }`;
                throw ex;
            }
        });
    }

    // add all the node types as listeners
    _addListenRule(key, rule) {
        Object.keys(rule).forEach(nodeType => {
            this.ruleTypeEmitter.on(nodeType, timing.enabled
                ? timing.time(key, rule[nodeType])
                : rule[nodeType]);
        });
    }
}
