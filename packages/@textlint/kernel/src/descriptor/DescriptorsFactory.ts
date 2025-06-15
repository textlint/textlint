// LICENSE : MIT
"use strict";
import { TextlintKernelFilterRule, TextlintKernelPlugin, TextlintKernelRule } from "../textlint-kernel-interface.js";
import { TextlintFilterRuleDescriptor } from "./TextlintFilterRuleDescriptor.js";
import { TextlintFilterRuleDescriptors } from "./TextlintFilterRuleDescriptors.js";
import { TextlintRuleDescriptors } from "./TextlintRuleDescriptors.js";
import { TextlintLintableRuleDescriptor } from "./TextlintLintableRuleDescriptor.js";
import { TextlintPluginDescriptors } from "./TextlintPluginDescriptors.js";
import { TextlintPluginDescriptor } from "./TextlintPluginDescriptor.js";
import { hasFixer } from "./rule-creator-helper.js";
import { TextlintFixableRuleDescriptor } from "./TextlintFixableRuleDescriptor.js";

export const createTextlintRuleDescriptors = (rules: TextlintKernelRule[]) => {
    const ruleOrFixableRuleDescriptorList = rules.map((rule) => {
        if (hasFixer(rule.rule)) {
            return new TextlintFixableRuleDescriptor(rule);
        } else {
            return new TextlintLintableRuleDescriptor(rule);
        }
    });
    return new TextlintRuleDescriptors(ruleOrFixableRuleDescriptorList);
};

export const createTextlintFilterRuleDescriptors = (rules: TextlintKernelFilterRule[]) => {
    return new TextlintFilterRuleDescriptors(rules.map((rule) => new TextlintFilterRuleDescriptor(rule)));
};

export const createTextlintPluginDescriptors = (rules: TextlintKernelPlugin[]) => {
    return new TextlintPluginDescriptors(rules.map((rule) => new TextlintPluginDescriptor(rule)));
};
