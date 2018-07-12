// LICENSE : MIT
"use strict";
import { TextlintKernelFilterRule } from "@textlint/kernel";
import { TextlintFilterRuleDescriptor } from "./TextlintFilterRuleDescriptor";

/**
 * The collection class of TextlintFilterRuleDescriptor
 */
export class TextlintFilterRuleDescriptors {
    constructor(private ruleDescriptorList: TextlintFilterRuleDescriptor[] = []) {}

    /**
     * Convert this to TextlintKernel rules format
     * @returns {Array}
     */
    toKernelFilterRulesFormat(): Array<TextlintKernelFilterRule> {
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
    withoutDuplicated(): TextlintFilterRuleDescriptors {
        // remove last duplicated item
        const newDescriptorList: TextlintFilterRuleDescriptor[] = [];
        this.ruleDescriptorList.forEach(descriptor => {
            const existsDescriptor = newDescriptorList.some(existDescriptor => {
                return existDescriptor.equals(descriptor);
            });
            if (!existsDescriptor) {
                newDescriptorList.push(descriptor);
            }
        });
        return new TextlintFilterRuleDescriptors(newDescriptorList);
    }
}
