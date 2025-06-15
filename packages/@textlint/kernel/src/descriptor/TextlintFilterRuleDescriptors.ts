// LICENSE : MIT
"use strict";
import { TextlintKernelFilterRule } from "../textlint-kernel-interface.js";
import { TextlintFilterRuleDescriptor } from "./TextlintFilterRuleDescriptor.js";
import { filterDuplicateDescriptor } from "./DescriptorUtil.js";

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
        return this.withoutDuplicated().descriptors.map((descriptor) => {
            return descriptor.toKernel();
        });
    }

    /**
     * Return enabled descriptors
     */
    get descriptors() {
        return this.ruleDescriptorList.filter((descriptor) => {
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
        const newDescriptorList = filterDuplicateDescriptor(this.ruleDescriptorList);
        return new TextlintFilterRuleDescriptors(newDescriptorList);
    }

    toJSON() {
        return this.descriptors.map((descriptor) => {
            return descriptor.toJSON();
        });
    }
}
