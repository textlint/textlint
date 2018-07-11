import { TextlintPluginCreator, TextlintRuleCreator, TextlintRuleOptions } from "@textlint/kernel";
import { TextlintPluginOptions } from "@textlint/fixer-formatter/lib/kernel";
import { TextlintRuleDescriptor } from "./TextlintRuleDescriptor";
import { TextlintPluginDescriptor } from "./TextlintPluginDescriptor";

export interface TextlintrcDescriptorArgs {
    rules: { [index: string]: TextlintRuleCreator };
    rulesOption: { [index: string]: TextlintRuleOptions };
    filterRules: { [index: string]: TextlintRuleCreator };
    filterRulesOption: { [index: string]: TextlintRuleOptions };
    plugins: { [index: string]: TextlintPluginCreator };
    pluginsOption: { [index: string]: TextlintPluginOptions };
}

export class TextlintrcDescriptor {
    rule: TextlintRuleDescriptor;
    filterRule: TextlintRuleDescriptor;
    plugin: TextlintPluginDescriptor;

    constructor(private args: TextlintrcDescriptorArgs) {
        this.rule = new TextlintRuleDescriptor(args.rules, args.rulesOption);
        this.filterRule = new TextlintRuleDescriptor(args.filterRules, args.filterRulesOption);
        this.plugin = new TextlintPluginDescriptor(args.plugins, args.pluginsOption);
    }

    get availableExtensions() {
        return this.plugin.availableExtensions;
    }

    merge(args: Partial<TextlintrcDescriptorArgs>) {
        return new TextlintrcDescriptor({
            ...this.args,
            ...args
        });
    }
}
