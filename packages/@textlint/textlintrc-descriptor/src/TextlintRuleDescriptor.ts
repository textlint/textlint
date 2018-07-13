// LICENSE : MIT
"use strict";
import {
    TextlintKernelRule,
    TextlintRuleCreateReporter,
    TextlintRuleCreator,
    TextlintRuleOptions
} from "@textlint/kernel";
import { getLinter, getFixer, hasLinter, hasFixer } from "./rule-creator-helper";

import deepEqual = require("deep-equal");

/**
 * Textlint Rule Descriptor.
 * It handle RuleCreator and RuleOption.
 */
export class TextlintRuleDescriptor {
    constructor(private textlintKernelRule: TextlintKernelRule) {}

    get id() {
        return this.textlintKernelRule.ruleId;
    }

    /**
     * Rule module-self
     */
    get rule(): TextlintRuleCreator {
        return this.textlintKernelRule.rule;
    }

    /**
     * Return true if this rule is enabled.
     */
    get enabled(): boolean {
        return this.normalizedOptions !== false;
    }

    get hasLinter() {
        return hasLinter(this.rule);
    }

    get hasFixer() {
        return hasFixer(this.rule);
    }

    /**
     * Return linter function
     * You should check hasLiner before call this.
     */
    get linter(): TextlintRuleCreateReporter {
        return getLinter(this.rule);
    }

    /**
     * Return fixer function
     * You should check hasFixer before call this.
     */
    get fixer(): TextlintRuleCreateReporter {
        return getFixer(this.rule);
    }

    /**
     * Return normalized rule option object.
     * If the rule have not option, return `true` by default.
     */
    get normalizedOptions(): TextlintRuleOptions {
        // default: { ruleName: true }
        const defaultRuleConfigValue = true;
        if (this.textlintKernelRule.options === undefined) {
            return defaultRuleConfigValue;
        } else {
            return this.textlintKernelRule.options;
        }
    }

    get rawOptions(): TextlintRuleOptions | undefined {
        return this.textlintKernelRule.options;
    }

    /**
     * Return true if descriptor is same
     */
    equals(descriptor: TextlintRuleDescriptor): boolean {
        return (
            this.textlintKernelRule.rule === descriptor.textlintKernelRule.rule &&
            deepEqual(this.normalizedOptions, descriptor.normalizedOptions, {
                strict: true
            })
        );
    }

    toKernel(): TextlintKernelRule {
        return this.textlintKernelRule;
    }
}
