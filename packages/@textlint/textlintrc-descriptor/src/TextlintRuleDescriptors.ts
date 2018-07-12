// LICENSE : MIT
"use strict";
import { TextlintKernelRule } from "@textlint/kernel";
import { TextlintRuleDescriptor } from "./TextlintRuleDescriptor";

/**
 * The collection class of TextlintRuleDescriptor
 */
export class TextlintRuleDescriptors {
    constructor(private ruleDescriptorList: TextlintRuleDescriptor[] = []) {}

    /**
     * Convert this to TextlintKernel rules format
     * @returns {Array}
     */
    toKernelRulesFormat(): Array<TextlintKernelRule> {
        return this.withoutDuplicated().descriptors.map(descriptor => {
            return descriptor.toKernel();
        });
    }

    /**
     * Return enabled descriptors
     */
    get descriptors() {
        return this.ruleDescriptorList.filter(descriptor => {
            return descriptor.enabled;
        });
    }

    /**
     * Return all descriptors that include disabled descriptors
     */
    get allDescriptors() {
        return this.ruleDescriptorList;
    }

    /**
     * filter duplicated descriptors
     */
    withoutDuplicated(): TextlintRuleDescriptors {
        // remove last duplicated item
        const newDescriptorList: TextlintRuleDescriptor[] = [];
        this.ruleDescriptorList.forEach(descriptor => {
            const existsDescriptor = newDescriptorList.some(existDescriptor => {
                return existDescriptor.equals(descriptor);
            });
            if (!existsDescriptor) {
                newDescriptorList.push(descriptor);
            }
        });
        return new TextlintRuleDescriptors(newDescriptorList);
    }
}
