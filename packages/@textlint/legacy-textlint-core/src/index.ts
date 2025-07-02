import type {
    TextlintFilterRuleReporter,
    TextlintFixResult,
    TextlintKernelFilterRule,
    TextlintKernelPlugin,
    TextlintKernelRule,
    TextlintPluginCreator,
    TextlintResult,
    TextlintRuleModule,
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
        options: true,
    },
    {
        pluginId: "@textlint/textlint-plugin-markdown",
        plugin: markdownPlugin,
        options: true,
    },
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
const rulesObjectToKernelRule: (
    rules: { [p: string]: TextlintRuleModule },
    rulesOption: { [p: string]: TextlintKernelRule["options"] }
) => TextlintKernelRule[] = (rules, rulesOption) => {
    return Object.keys(rules).map((ruleId) => {
        return {
            ruleId,
            rule: rules[ruleId],
            options: rulesOption[ruleId],
        };
    });
};

const filterRulesObjectToKernelRule: (
    rules: { [p: string]: TextlintFilterRuleReporter },
    rulesOption: { [p: string]: TextlintKernelFilterRule["options"] }
) => TextlintKernelFilterRule[] = (rules, rulesOption): TextlintKernelFilterRule[] => {
    return Object.keys(rules).map((ruleId) => {
        return {
            ruleId,
            rule: rules[ruleId],
            options: rulesOption[ruleId],
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
            options: pluginsOption[pluginId],
        };
    });
};

/**
 * Create `TextLintCore` compat interface using `@textlint/kernel`
 * It will help us to migrate to `@textlint/kernel` from `textlint`.
 */
export class TextLintCore {
    private kernelDescriptor = new TextlintKernelDescriptor({
        rules: [],
        plugins: builtInPlugins,
        filterRules: [],
    });

    constructor(_THIS_ARG_IS_JUST_IGNORED: unknown[] = []) {
        // noop
    }

    /**
     * setup rules
     * @param rules
     * @param rulesOption
     */
    setupRules(rules = {}, rulesOption = {}): void {
        this.kernelDescriptor = this.kernelDescriptor.concat(
            new TextlintKernelDescriptor({
                rules: rulesObjectToKernelRule(rules, rulesOption),
                filterRules: [],
                plugins: [],
            })
        );
    }

    /**
     * setup filter rules
     * @param filterRules
     * @param filterRulesConfig
     */
    setupFilterRules(filterRules = {}, filterRulesConfig = {}): void {
        this.kernelDescriptor = this.kernelDescriptor.concat(
            new TextlintKernelDescriptor({
                rules: [],
                filterRules: filterRulesObjectToKernelRule(filterRules, filterRulesConfig),
                plugins: [],
            })
        );
    }

    /**
     * reset defined rules
     * reset to initial state
     */
    resetRules(): void {
        this.kernelDescriptor = new TextlintKernelDescriptor({
            rules: [],
            filterRules: [],
            plugins: builtInPlugins,
        });
    }

    /**
     * setup plugins
     * @param plugins
     * @param pluginsConfig
     */
    setupPlugins(plugins = {}, pluginsConfig = {}) {
        this.kernelDescriptor = this.kernelDescriptor.concat(
            new TextlintKernelDescriptor({
                rules: [],
                filterRules: [],
                plugins: pluginsObjectToKernelRule(plugins, pluginsConfig),
            })
        );
    }

    /**
     * lint text and return results
     * default ext is ".txt"
     * @param text
     * @param ext
     */
    async lintText(text: string, ext = ".txt"): Promise<TextlintResult> {
        const kernel = new TextlintKernel();
        return kernel.lintText(text, {
            ext,
            ...this.kernelDescriptor.toKernelOptions(),
        });
    }

    /**
     * lint text as markdown and return results
     * @param text
     */
    async lintMarkdown(text: string): Promise<TextlintResult> {
        const kernel = new TextlintKernel();
        return kernel.lintText(text, {
            ext: ".md",
            ...this.kernelDescriptor.toKernelOptions(),
        });
    }

    /**
     * lint file and return results
     * @param filePath
     */
    async lintFile(filePath: string): Promise<TextlintResult> {
        const content = await fs.readFile(filePath, "utf-8");
        const kernel = new TextlintKernel();
        return kernel.lintText(content, {
            ext: path.extname(filePath),
            filePath,
            ...this.kernelDescriptor.toKernelOptions(),
        });
    }

    /**
     * fix text and return results
     * default ext is ".txt"
     * @param text
     * @param ext
     */
    async fixText(text: string, ext = ".txt"): Promise<TextlintFixResult> {
        const kernel = new TextlintKernel();
        return kernel.fixText(text, {
            ext,
            ...this.kernelDescriptor.toKernelOptions(),
        });
    }

    /**
     * fix file and return results
     */
    async fixFile(filePath: string): Promise<TextlintFixResult> {
        const content = await fs.readFile(filePath, "utf-8");
        const kernel = new TextlintKernel();
        return kernel.fixText(content, {
            ext: path.extname(filePath),
            filePath,
            ...this.kernelDescriptor.toKernelOptions(),
        });
    }
}
