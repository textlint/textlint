import { loadConfig } from "@textlint/config-loader";
import { TextlintKernelDescriptor, TextlintKernelPlugin } from "@textlint/kernel";
import path from "node:path";
import textPlugin from "@textlint/textlint-plugin-text";
import markdownPlugin from "@textlint/textlint-plugin-markdown";
import debug_ from "debug";

const debug = debug_("textlint:loader:TextlintrcLoader");
export type LoadTextlintrcOptions = {
    /**
     * config file path
     * /path/to/.textlintrc
     */
    configFilePath?: string;
    /**
     * custom node_modules directory
     */
    node_modulesDir?: string;
};
// Built-in plugins should be loaded from same directory with `textlint` package
export const builtInPlugins: TextlintKernelPlugin[] = [
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
export const loadBuiltinPlugins = async (): Promise<TextlintKernelDescriptor> => {
    return new TextlintKernelDescriptor({
        rules: [],
        filterRules: [],
        plugins: builtInPlugins
    });
};
export const loadTextlintrc = async (options?: LoadTextlintrcOptions): Promise<TextlintKernelDescriptor> => {
    const result = await loadConfig({
        configFilePath: options?.configFilePath,
        node_modulesDir: options?.node_modulesDir
    });

    if (!result.ok) {
        debug("loadTextlintrc failed: %o", result);
        return loadBuiltinPlugins();
    }
    const { rules, plugins, filterRules } = result.config;
    return new TextlintKernelDescriptor({
        rules,
        plugins: [...builtInPlugins, ...plugins],
        filterRules,
        configBaseDir: path.dirname(result.configFilePath)
    });
};
