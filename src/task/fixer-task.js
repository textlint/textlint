// LICENSE : MIT
"use strict";
import CoreTask from "./textlint-core-task";
import RuleContext from "./../rule/rule-context";
import timing from "./../util/timing";
import {getFixer} from "../rule/rule-creator-helper";
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
        const rules = this.rules;
        const config = this.config;
        const rulesConfig = this.rulesConfig;
        const textLintConfig = config;
        const sourceCode = this.sourceCode;
        const report = this.report.bind(this);
        Object.keys(rules).forEach(key => {
            const ruleCreator = rules[key];
            const ruleConfig = rulesConfig[key];
            try {
                const ruleContext = new RuleContext(key, sourceCode, report, textLintConfig, ruleConfig);
                const ruleObject = getFixer(ruleCreator, key)(ruleContext, ruleConfig);
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