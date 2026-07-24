// LICENSE : MIT
import { getFilter } from "./rule-creator-helper.js";
import type { TextlintKernelFilterRule } from "../textlint-kernel-interface.js";
import type { Descriptor } from "./Descriptor.js";
import type { TextlintFilterRuleOptions, TextlintFilterRuleReporter } from "@textlint/types";
import { deepEqual } from "fast-equals";

/**
 * Textlint Rule Descriptor.
 * It handles RuleCreator and RuleOption.
 */
export class TextlintFilterRuleDescriptor implements Descriptor<TextlintKernelFilterRule> {
    constructor(private kernelFilterRule: TextlintKernelFilterRule) {}

    get id() {
        return this.kernelFilterRule.ruleId;
    }

    get rule(): TextlintFilterRuleReporter {
        return this.kernelFilterRule.rule;
    }

    /**
     * Return true if this rule is enabled.
     */
    get enabled(): boolean {
        return this.rawOptions !== false;
    }

    /**
     * Return filter function
     * You should check hasLiner before call this.
     */
    get filter() {
        return getFilter(this.rule);
    }

    /**
     * Return normalized rule option object.
     * If the rule have not options, return `true` by default.
     */
    get normalizedOptions(): TextlintFilterRuleOptions {
        // default: { ruleName: true }
        const DefaultRuleConfigValue = {};
        if (typeof this.kernelFilterRule.options === "boolean" || this.kernelFilterRule.options === undefined) {
            return DefaultRuleConfigValue;
        } else {
            return this.kernelFilterRule.options;
        }
    }

    get rawOptions(): undefined | boolean | TextlintFilterRuleOptions {
        return this.kernelFilterRule.options;
    }

    /**
     * Return true if descriptor is same
     */
    equals(descriptor: this): boolean {
        return this.rule === descriptor.rule && deepEqual(this.normalizedOptions, descriptor.normalizedOptions);
    }

    toKernel() {
        return this.kernelFilterRule;
    }

    toJSON() {
        return {
            id: this.id,
            options: this.normalizedOptions
        };
    }
}
