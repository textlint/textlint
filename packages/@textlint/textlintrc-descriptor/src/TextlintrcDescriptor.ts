import { TextlintKernelFilterRule, TextlintKernelPlugin, TextlintKernelRule } from "@textlint/kernel";
import { TextlintRuleDescriptors } from "./TextlintRuleDescriptors";
import { TextlintPluginDescriptors } from "./TextlintPluginDescriptors";
import { TextlintFilterRuleDescriptors } from "./TextlintFilterRuleDescriptors";
import {
    createTextlintFilterRuleDescriptors,
    createTextlintPluginDescriptors,
    createTextlintRuleDescriptors
} from "./DescriptorsFactory";
import { TextlintPluginDescriptor } from "./TextlintPluginDescriptor";

export interface TextlintrcDescriptorArgs {
    rules: TextlintKernelRule[];
    filterRules: TextlintKernelFilterRule[];
    plugins: TextlintKernelPlugin[];
}

export class TextlintrcDescriptor {
    rule: TextlintRuleDescriptors;
    filterRule: TextlintFilterRuleDescriptors;
    plugin: TextlintPluginDescriptors;

    constructor(private args: TextlintrcDescriptorArgs) {
        this.rule = createTextlintRuleDescriptors(args.rules);
        this.filterRule = createTextlintFilterRuleDescriptors(args.filterRules);
        this.plugin = createTextlintPluginDescriptors(args.plugins);
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

    findPluginDescriptorWithExt(ext: string): TextlintPluginDescriptor | undefined {
        return this.plugin.findPluginDescriptorWithExt(ext);
    }
}
