import {
    TextlintKernelFilterRule,
    TextlintKernelOptions,
    TextlintKernelPlugin,
    TextlintKernelRule
} from "../textlint-kernel-interface";
import { TextlintRuleDescriptors } from "./TextlintRuleDescriptors";
import { TextlintPluginDescriptors } from "./TextlintPluginDescriptors";
import { TextlintFilterRuleDescriptors } from "./TextlintFilterRuleDescriptors";
import {
    createTextlintFilterRuleDescriptors,
    createTextlintPluginDescriptors,
    createTextlintRuleDescriptors
} from "./DescriptorsFactory";
import { TextlintPluginDescriptor } from "./TextlintPluginDescriptor";

export interface TextlintKernelDescriptorArgs {
    // config base directory
    configBaseDir?: string;
    rules: TextlintKernelRule[];
    filterRules: TextlintKernelFilterRule[];
    plugins: TextlintKernelPlugin[];
}

export class TextlintKernelDescriptor {
    readonly rule: TextlintRuleDescriptors;
    readonly filterRule: TextlintFilterRuleDescriptors;
    readonly plugin: TextlintPluginDescriptors;
    readonly configBaseDir?: string;

    constructor(private args: TextlintKernelDescriptorArgs) {
        this.rule = createTextlintRuleDescriptors(args.rules);
        this.filterRule = createTextlintFilterRuleDescriptors(args.filterRules);
        this.plugin = createTextlintPluginDescriptors(args.plugins);
        this.configBaseDir = args.configBaseDir;
    }

    /**
     * Return available extensions of plugins
     */
    get availableExtensions() {
        return this.plugin.availableExtensions;
    }

    /**
     * Merge constructor args and partialArgs
     * It shallow merge partialArgs.
     * It means that overwrite own properties by partialArgs.
     */
    shallowMerge(partialArgs: Partial<TextlintKernelDescriptorArgs>) {
        return new TextlintKernelDescriptor({
            ...this.args,
            ...partialArgs
        });
    }

    /**
     * Concat descriptors
     * If A.concat(B), A is base, B is added
     * Note: withoutDuplicated pick A from [A, B] If A and B have same ruleId.
     * @param other
     */
    concat(other: TextlintKernelDescriptor) {
        return new TextlintKernelDescriptor({
            configBaseDir: other.configBaseDir ?? this.configBaseDir,
            rules: this.rule.toKernelRulesFormat().concat(other.rule.toKernelRulesFormat()),
            filterRules: this.filterRule
                .toKernelFilterRulesFormat()
                .concat(other.filterRule.toKernelFilterRulesFormat()),
            plugins: this.plugin.toKernelPluginsFormat().concat(other.plugin.toKernelPluginsFormat())
        });
    }

    /**
     * find PluginDescriptor with extension.
     * This is forward match.
     *
     * If following config of textlint, this method prefer to select MarkdownA for markdown.
     *
     * {
     *     "plugins": [MarkdownA, MarkdownB]
     * }
     */
    findPluginDescriptorWithExt(ext: string): TextlintPluginDescriptor | undefined {
        return this.plugin.findPluginDescriptorWithExt(ext);
    }

    /**
     * Convert descriptor to TextlintKernelOptions
     */
    toKernelOptions(): Pick<TextlintKernelOptions, "configBaseDir" | "rules" | "filterRules" | "plugins"> {
        return {
            configBaseDir: this.configBaseDir,
            rules: this.rule.toKernelRulesFormat(),
            filterRules: this.filterRule.toKernelFilterRulesFormat(),
            plugins: this.plugin.toKernelPluginsFormat()
        };
    }

    toJSON() {
        return {
            rule: this.rule.toJSON(),
            filterRule: this.filterRule.toJSON(),
            plugin: this.plugin.toJSON(),
            configBaseDir: this.configBaseDir
        };
    }
}
