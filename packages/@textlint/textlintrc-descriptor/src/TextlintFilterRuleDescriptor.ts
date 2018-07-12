// LICENSE : MIT
"use strict";
import { getFilter, hasLinter } from "./rule-creator-helper";
import { TextlintFilterRuleCreator, TextlintFilterRuleOptions, TextlintKernelFilterRule } from "@textlint/kernel";

const deepEqual = require("deep-equal");

/**
 * Textlint Rule Descriptor.
 * It handle RuleCreator and RuleOption.
 */
export class TextlintFilterRuleDescriptor {
    constructor(private kernelFilterRule: TextlintKernelFilterRule) {}

    get id() {
        return this.kernelFilterRule.ruleId;
    }

    get rule(): TextlintFilterRuleCreator {
        return this.kernelFilterRule.rule;
    }

    /**
     * Return true if this rule is enabled.
     */
    get enabled(): boolean {
        return this.normalizedOptions !== false;
    }

    get hasLinter() {
        return hasLinter(this.kernelFilterRule);
    }

    /**
     * Return linter function
     * You should check hasLiner before call this.
     */
    get filter() {
        return getFilter(this.kernelFilterRule);
    }

    /**
     * Return normalized rule option object.
     * If the rule have not option, return `true` by default.
     */
    get normalizedOptions(): TextlintFilterRuleOptions {
        // default: { ruleName: true }
        const defaultRuleConfigValue = true;
        if (this.kernelFilterRule.options === undefined) {
            return defaultRuleConfigValue;
        } else {
            return this.kernelFilterRule.options;
        }
    }

    get rawOptions(): TextlintFilterRuleOptions | undefined {
        return this.kernelFilterRule.options;
    }

    /**
     * Return true if descriptor is same
     */
    equals(descriptor: TextlintFilterRuleDescriptor): boolean {
        return this.rule === descriptor.rule && deepEqual(this.normalizedOptions, descriptor.normalizedOptions);
    }

    toKernel(): TextlintKernelFilterRule {
        return this.kernelFilterRule;
    }
}
