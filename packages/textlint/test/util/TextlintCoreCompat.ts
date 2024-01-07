import type {
    TextlintFilterRuleReporter,
    TextlintKernelFilterRule,
    TextlintKernelPlugin,
    TextlintKernelRule,
    TextlintPluginCreator,
    TextlintRuleModule
} from "@textlint/kernel";
import { TextlintKernel, TextlintKernelDescriptor } from "@textlint/kernel";
import fs from "node:fs/promises";
import path from "node:path";
import textPlugin from "@textlint/textlint-plugin-text";
import markdownPlugin from "@textlint/textlint-plugin-markdown";

// text and markdown are built-in plugins
const builtInPlugins = [
    {
        pluginId: "@textlint/textlint-plugin-text",
        plugin: textPlugin,
        options: true
    },
    {
        pluginId: "@textlint/textlint-plugin-markdown",
        plugin: markdownPlugin,
        options: true
    }
];
/**
 * Convert rulesObject to TextlintKernelRule
 * {
 *     "rule-name": rule
 * },
 * {
 *     "rule-name": ruleOption
 * }
 *
 * => TextlintKernelRule
 */
export const rulesObjectToKernelRule: (
    rules: { [p: string]: TextlintRuleModule },
    rulesOption: { [p: string]: TextlintKernelRule["options"] }
) => TextlintKernelRule[] = (rules, rulesOption) => {
    return Object.keys(rules).map((ruleId) => {
        return {
            ruleId,
            rule: rules[ruleId],
            options: rulesOption[ruleId]
        };
    });
};

export const filterRulesObjectToKernelRule: (
    rules: { [p: string]: TextlintFilterRuleReporter },
    rulesOption: { [p: string]: TextlintKernelFilterRule["options"] }
) => TextlintKernelFilterRule[] = (rules, rulesOption): TextlintKernelFilterRule[] => {
    return Object.keys(rules).map((ruleId) => {
        return {
            ruleId,
            rule: rules[ruleId],
            options: rulesOption[ruleId]
        };
    });
};

/**
 * Convert pluginsObject to TextlintKernelPlugin
 * {
 *     "plugin-name": plugin
 * },
 * {
 *     "plugin-name": pluginOption
 * }
 *
 * => TextlintKernelPlugin
 */
export const pluginsObjectToKernelRule = (
    plugins: { [index: string]: TextlintPluginCreator },
    pluginsOption: { [index: string]: TextlintKernelPlugin["options"] }
): TextlintKernelPlugin[] => {
    return Object.keys(plugins).map((pluginId) => {
        return {
            pluginId,
            plugin: plugins[pluginId],
            options: pluginsOption[pluginId]
        };
    });
};

/**
 * Create `TextLintCore` like interface using `@textlint/kernel`
 * It will help us to migrate to `@textlint/kernel` from `textlint`.
 */
export class TextLintCoreCompat {
    private kernelDescriptor = new TextlintKernelDescriptor({
        rules: [],
        plugins: builtInPlugins,
        filterRules: []
    });

    setupRules(rules = {}, rulesOption = {}) {
        this.kernelDescriptor = this.kernelDescriptor.concat(
            new TextlintKernelDescriptor({
                rules: rulesObjectToKernelRule(rules, rulesOption),
                filterRules: [],
                plugins: []
            })
        );
    }

    setupFilterRules(filterRules = {}, filterRulesConfig = {}) {
        this.kernelDescriptor = this.kernelDescriptor.concat(
            new TextlintKernelDescriptor({
                rules: [],
                filterRules: filterRulesObjectToKernelRule(filterRules, filterRulesConfig),
                plugins: []
            })
        );
    }

    setupPlugins(plugins = {}, pluginsConfig = {}) {
        this.kernelDescriptor = this.kernelDescriptor.concat(
            new TextlintKernelDescriptor({
                rules: [],
                filterRules: [],
                plugins: pluginsObjectToKernelRule(plugins, pluginsConfig)
            })
        );
    }

    async lintText(text: string, ext = ".txt") {
        const kernel = new TextlintKernel();
        return kernel.lintText(text, {
            ext,
            ...this.kernelDescriptor.toKernelOptions()
        });
    }

    async lintMarkdown(text: string) {
        const kernel = new TextlintKernel();
        return kernel.lintText(text, {
            ext: ".md",
            ...this.kernelDescriptor.toKernelOptions()
        });
    }

    async lintFile(filePath: string) {
        const content = await fs.readFile(filePath, "utf-8");
        const kernel = new TextlintKernel();
        return kernel.lintText(content, {
            ext: path.extname(filePath),
            filePath,
            ...this.kernelDescriptor.toKernelOptions()
        });
    }

    async fixText(text: string, ext = ".txt") {
        const kernel = new TextlintKernel();
        return kernel.fixText(text, {
            ext,
            ...this.kernelDescriptor.toKernelOptions()
        });
    }
}
