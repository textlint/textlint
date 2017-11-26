/**
 * Manage RuleCreator*s* object and RuleOption*s*
 */
export declare class RuleCreatorSet {
    rulesConfig: {
        [index: string]: any;
    };
    ruleNames: string[];
    rules: any;
    rawRulesConfigObject: object;
    rawRulesObject: object;
    /**
     * @param {Object} [rules]
     * @param {Object} [rulesConfig]
     * @constructor
     */
    constructor(rules?: object, rulesConfig?: object);
    /**
     * Convert this to TextlintKernel rules format
     * @returns {Array}
     */
    toKernelRulesFormat(): Array<any>;
    /**
     * filter duplicated rules and rulesConfig and return new RuleCreatorSet.
     * @return {RuleCreatorSet}
     */
    withoutDuplicated(): RuleCreatorSet;
    /**
     * forEach method
     * @example
     *  ruleCreatorSet.forEach(({ruleId, rule, ruleConfig}) => {
     *      //
     *  });
     * @param {function({ ruleId: string, rule: Function, ruleConfig: Object|boolean})} handler
     */
    forEach(handler: (arg0: {
        ruleId: string;
        rule: Function;
        ruleConfig: object | boolean;
    }) => void): void;
    getFixerNames(): string[];
    mapFixer(mapHandler: (set: RuleCreatorSet) => any): any[];
    /**
     * normalize `rawRulesConfigObject`.
     * if `rawRulesConfigObject` has not the rule, create `{ ruleName: true }` by default
     * @param {string[]} ruleNames
     * @param {Object} rawRulesConfigObject
     * @private
     */
    _normalizeRulesConfig(ruleNames: string[], rawRulesConfigObject: {
        [index: string]: any;
    }): {
        [index: string]: any;
    };
}
