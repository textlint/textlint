// LICENSE : MIT
"use strict";
import { TextlintKernelFilterRule, TextlintKernelPlugin, TextlintKernelRule } from "../textlint-kernel-interface";
import { TextlintFilterRuleDescriptor } from "./TextlintFilterRuleDescriptor";
import { TextlintFilterRuleDescriptors } from "./TextlintFilterRuleDescriptors";
import { TextlintRuleDescriptors } from "./TextlintRuleDescriptors";
import { TextlintRuleDescriptor } from "./TextlintRuleDescriptor";
import { TextlintPluginDescriptors } from "./TextlintPluginDescriptors";
import { TextlintPluginDescriptor } from "./TextlintPluginDescriptor";

export const createTextlintRuleDescriptors = (rules: TextlintKernelRule[]) => {
    return new TextlintRuleDescriptors(rules.map(rule => new TextlintRuleDescriptor(rule)));
};

export const createTextlintFilterRuleDescriptors = (rules: TextlintKernelFilterRule[]) => {
    return new TextlintFilterRuleDescriptors(rules.map(rule => new TextlintFilterRuleDescriptor(rule)));
};

export const createTextlintPluginDescriptors = (rules: TextlintKernelPlugin[]) => {
    return new TextlintPluginDescriptors(rules.map(rule => new TextlintPluginDescriptor(rule)));
};
