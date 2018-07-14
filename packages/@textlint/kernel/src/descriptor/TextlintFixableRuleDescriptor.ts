// LICENSE : MIT
"use strict";
import { getFixer } from "./rule-creator-helper";
import { TextlintRuleReporter } from "../textlint-kernel-interface";
import { TextlintLintableRuleDescriptor } from "./TextlintLintableRuleDescriptor";
import { TextlintRuleDescriptorType } from "./TextlintRuleDescriptorType";

/**
 * Textlint Fixable Rule Descriptor.
 * It is inherit **Rule** Descriptor and add fixer() method.
 * It handle RuleCreator and RuleOption.
 */
export class TextlintFixableRuleDescriptor extends TextlintLintableRuleDescriptor {
    get type() {
        return TextlintRuleDescriptorType.LINTER_AND_FIXER;
    }

    /**
     * Return fixer function
     * You should check hasFixer before call this.
     */
    get fixer(): TextlintRuleReporter {
        return getFixer(this.rule);
    }
}
