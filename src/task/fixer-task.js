// LICENSE : MIT
"use strict";
import CoreTask from "./textlint-core-task";
import {getFixer} from "../core/rule-creator-helper";
export default class TextLintCoreTask extends CoreTask {
    /**
     * @param {Function} ruleCreator
     * @param {RuleContext} ruleContext
     * @param {Object|boolean} ruleConfig
     * @returns {Object}
     */
    getRuleObject(ruleCreator, ruleContext, ruleConfig) {
        try {
            return getFixer(ruleCreator)(ruleContext, ruleConfig);
        } catch (error) {
            error.message = `Error while loading rule '${ruleContext.id}': ${error.message}`;
            throw error;
        }
    }
}
