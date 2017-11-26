import { ASTNodeTypes } from "@textlint/ast-node-types";
import RuleContext from "./rule-context";
import { TextlintRuleOptions, TxtNode } from "../textlint-kernel-interface";
import FilterRuleContext from "./filter-rule-context";
/**
 * Reporter function
 *
 * FIXME: Separate RuleCreatorReporter to FilterRuleCreatorReporter
 */
export declare type RuleCreatorReporter = (context: RuleContext | FilterRuleContext, options?: TextlintRuleOptions | boolean) => {
    [P in keyof typeof ASTNodeTypes]?: (node: TxtNode) => void | Promise<any>;
};
export declare type RuleFixableCreator = {
    linter: RuleCreatorReporter;
    fixer: RuleCreatorReporter;
};
export declare type TextLintRuleCreator = RuleCreatorReporter | RuleFixableCreator;
/**
 * detect that ruleCreator has linter function
 * @param {*} ruleCreator
 * @returns {boolean}
 */
export declare function hasLinter(ruleCreator: TextLintRuleCreator): boolean;
/**
 * get linter function from ruleCreator
 * if not found, throw error
 * @param {Function|Object} ruleCreator
 * @returns {Function} linter function
 * @throws
 */
export declare function getLinter(ruleCreator: TextLintRuleCreator): RuleCreatorReporter;
/**
 * detect that ruleCreator has fixer function
 * @param {*} ruleCreator
 * @returns {boolean}
 */
export declare function hasFixer(ruleCreator: TextLintRuleCreator): ruleCreator is RuleFixableCreator;
/**
 * get fixer function from ruleCreator
 * if not found, throw error
 * @param {Function|Object} ruleCreator
 * @returns {Function} fixer function
 * @throws
 */
export declare function getFixer(ruleCreator: TextLintRuleCreator): RuleCreatorReporter;
/**
 * RuleModule should has either linter or fixer.
 * @param ruleCreator
 * @returns {boolean}
 **/
export declare function isRuleModule(ruleCreator: TextLintRuleCreator): boolean;
/**
 * Validate rule module.
 * if invalid throw error
 * @param {*} ruleModule
 * @param {string} key
 * @throws
 */
export declare function assertRuleShape(ruleModule: any, key?: string): void;
/**
 * get linter function from ruleCreator
 * if not found, throw error
 * @param {*} ruleCreator
 * @returns {Function} linter function
 * @throws
 */
export declare function getFilter(ruleCreator: TextLintRuleCreator): RuleCreatorReporter;
